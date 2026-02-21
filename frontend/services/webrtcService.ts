import { getSocket } from "@/socket/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/constants";

// ICE server configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export type CallType = "audio" | "video";

export interface CallCallbacks {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallStatusChanged?: (status: string) => void;
  onCallEnded?: (duration?: number) => void;
  onError?: (error: string) => void;
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private currentUserId: string | null = null;
  private callbacks: CallCallbacks = {};
  private isInitiator: boolean = false;
  private isMuted: boolean = false;
  private isSpeakerOn: boolean = false;
  private isCameraOn: boolean = true;

  // Initialize the service
  async initialize() {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      // Decode token to get user ID (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        this.currentUserId = payload.userId;
      } catch (e) {
        console.error("[DEBUG] WebRTC: Failed to decode token:", e);
      }
    }
    this.setupSocketListeners();
  }

  // Setup socket event listeners
  private setupSocketListeners() {
    const socket = getSocket();
    if (!socket) {
      console.warn("[DEBUG] WebRTC: Socket not initialized");
      return;
    }

    // Incoming call
    socket.on("incomingCall", (data: {
      callId: string;
      callerId: string;
      type: CallType;
      conversationId?: string;
    }) => {
      console.log("[DEBUG] WebRTC: Incoming call from", data.callerId);
      this.callbacks.onCallStatusChanged?.("ringing");
    });

    // Call accepted
    socket.on("callAccepted", async (data: {
      callId: string;
      calleeId: string;
      iceServers?: any;
    }) => {
      console.log("[DEBUG] WebRTC: Call accepted");
      if (this.peerConnection) {
        try {
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          
          socket.emit("callAnswer", {
            callId: data.callId,
            answer: answer,
            targetUserId: data.calleeId,
          });
        } catch (error) {
          console.error("[DEBUG] WebRTC: Error creating answer:", error);
        }
      }
      this.callbacks.onCallStatusChanged?.("connected");
    });

    // Call declined
    socket.on("callDeclined", (data: {
      callId: string;
      declinedBy: string;
    }) => {
      console.log("[DEBUG] WebRTC: Call declined by", data.declinedBy);
      this.cleanup();
      this.callbacks.onCallStatusChanged?.("declined");
    });

    // Call ended
    socket.on("callEnded", (data: {
      callId: string;
      endedBy: string;
      duration?: number;
    }) => {
      console.log("[DEBUG] WebRTC: Call ended by", data.endedBy);
      this.cleanup();
      this.callbacks.onCallStatusChanged?.("ended");
      this.callbacks.onCallEnded?.(data.duration);
    });

    // Call status changed
    socket.on("callStatusChanged", (data: {
      callId: string;
      status: string;
    }) => {
      console.log("[DEBUG] WebRTC: Call status changed to", data.status);
      this.callbacks.onCallStatusChanged?.(data.status);
    });

    // Receive offer
    socket.on("callOffer", async (data: {
      callId: string;
      offer: RTCSessionDescriptionInit;
      from: string;
    }) => {
      console.log("[DEBUG] WebRTC: Received offer from", data.from);
      await this.handleOffer(data.callId, data.offer, data.from);
    });

    // Receive answer
    socket.on("callAnswer", async (data: {
      callId: string;
      answer: RTCSessionDescriptionInit;
      from: string;
    }) => {
      console.log("[DEBUG] WebRTC: Received answer from", data.from);
      await this.handleAnswer(data.answer);
    });

    // Receive ICE candidate
    socket.on("callIceCandidate", async (data: {
      callId: string;
      candidate: RTCIceCandidateInit;
      from: string;
    }) => {
      console.log("[DEBUG] WebRTC: Received ICE candidate from", data.from);
      await this.handleIceCandidate(data.candidate);
    });

    // Media toggled
    socket.on("mediaToggled", (data: {
      callId: string;
      type: "audio" | "video";
      enabled: boolean;
      from: string;
    }) => {
      console.log("[DEBUG] WebRTC: Media toggled", data.type, "to", data.enabled);
      // Could emit event to UI to show remote user muted/camera off
    });
  }

  // Set callbacks
  setCallbacks(callbacks: CallCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Start local stream
  async startLocalStream(type: CallType): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === "video" ? {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.callbacks.onLocalStream?.(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error("[DEBUG] WebRTC: Error starting local stream:", error);
      throw error;
    }
  }

  // Stop local stream
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // Create peer connection
  private createPeerConnection(otherUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS.iceServers,
    });

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log("[DEBUG] WebRTC: Received remote track");
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.callbacks.onRemoteStream?.(this.remoteStream);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = getSocket();
        if (socket && this.currentCallId) {
          socket.emit("callIceCandidate", {
            callId: this.currentCallId,
            candidate: event.candidate,
            targetUserId: otherUserId,
          });
        }
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("[DEBUG] WebRTC: Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        this.callbacks.onCallStatusChanged?.("connected");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.callbacks.onCallStatusChanged?.("ended");
        this.cleanup();
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log("[DEBUG] WebRTC: ICE connection state:", pc.iceConnectionState);
    };

    this.peerConnection = pc;
    return pc;
  }

  // Initiate a call
  async initiateCall(callId: string, otherUserId: string, type: CallType): Promise<void> {
    this.isInitiator = true;
    this.currentCallId = callId;

    try {
      // Start local stream
      await this.startLocalStream(type);

      // Create peer connection
      const pc = this.createPeerConnection(otherUserId);

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to other user
      const socket = getSocket();
      if (socket) {
        socket.emit("callOffer", {
          callId,
          offer,
          targetUserId: otherUserId,
        });
      }

      this.callbacks.onCallStatusChanged?.("calling");
    } catch (error) {
      console.error("[DEBUG] WebRTC: Error initiating call:", error);
      this.callbacks.onError?.("Failed to initiate call");
      throw error;
    }
  }

  // Handle incoming offer
  private async handleOffer(callId: string, offer: RTCSessionDescriptionInit, fromUserId: string): Promise<void> {
    this.currentCallId = callId;
    this.isInitiator = false;

    try {
      if (!this.localStream) {
        // If no local stream, we need to create one
        // For incoming calls, we need to start local stream first
        console.log("[DEBUG] WebRTC: Need to start local stream for incoming call");
      }

      const pc = this.createPeerConnection(fromUserId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer
      const socket = getSocket();
      if (socket) {
        socket.emit("callAnswer", {
          callId,
          answer,
          targetUserId: fromUserId,
        });
      }
    } catch (error) {
      console.error("[DEBUG] WebRTC: Error handling offer:", error);
      this.callbacks.onError?.("Failed to handle call");
    }
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection) {
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("[DEBUG] WebRTC: Error handling answer:", error);
      }
    }
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.peerConnection) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("[DEBUG] WebRTC: Error handling ICE candidate:", error);
      }
    }
  }

  // Toggle mute
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted = !audioTrack.enabled;
        
        // Notify other party
        const socket = getSocket();
        if (socket && this.currentCallId && this.currentUserId) {
          socket.emit("toggleMedia", {
            callId: this.currentCallId,
            type: "audio",
            enabled: audioTrack.enabled,
            targetUserId: "", // Will be set by the server
          });
        }
        
        return this.isMuted;
      }
    }
    return false;
  }

  // Toggle speaker
  toggleSpeaker(): boolean {
    this.isSpeakerOn = !this.isSpeakerOn;
    return this.isSpeakerOn;
  }

  // Toggle camera
  toggleCamera(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isCameraOn = videoTrack.enabled;
        
        // Notify other party
        const socket = getSocket();
        if (socket && this.currentCallId) {
          socket.emit("toggleMedia", {
            callId: this.currentCallId,
            type: "video",
            enabled: videoTrack.enabled,
            targetUserId: "", // Will be set by the server
          });
        }
        
        return this.isCameraOn;
      }
    }
    return false;
  }

  // Get current mute state
  getMuteState(): boolean {
    return this.isMuted;
  }

  // Get current speaker state
  getSpeakerState(): boolean {
    return this.isSpeakerOn;
  }

  // Get current camera state
  getCameraState(): boolean {
    return this.isCameraOn;
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Cleanup
  cleanup() {
    console.log("[DEBUG] WebRTC: Cleaning up");
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.stopLocalStream();
    this.remoteStream = null;
    this.currentCallId = null;
    this.isInitiator = false;
    this.isMuted = false;
    this.isCameraOn = true;
  }

  // End call
  async endCall(callId: string): Promise<void> {
    const socket = getSocket();
    if (socket) {
      socket.emit("endCall", { callId });
    }
    this.cleanup();
  }
}

// Export singleton instance
export const webRTCService = new WebRTCService();
export default webRTCService;
