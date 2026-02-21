import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error('Stream API credentials not found in environment variables');
}

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export const generateStreamToken = (userId: string): string => {
  return serverClient.createToken(userId);
};

export const createStreamUser = async (userId: string, name: string, avatar?: string) => {
  try {
    await serverClient.upsertUser({
      id: userId,
      name: name,
      image: avatar || `https://api.dicebear.com/7.x/adventurer/png?seed=${name}`,
    });
    console.log(`[DEBUG] Stream: User ${userId} created/updated`);
  } catch (error) {
    console.error('[DEBUG] Stream: Error creating user:', error);
    throw error;
  }
};

export const createStreamChannel = async (
  channelType: 'messaging' | 'team',
  channelId: string,
  createdBy: string,
  members: string[],
  name?: string
) => {
  try {
    const channelData: any = {
      created_by_id: createdBy,
      members: members,
    };
    
    // Add name only for team channels (groups)
    if (name && channelType === 'team') {
      channelData.name = name;
    }
    
    const channel = serverClient.channel(channelType, channelId, channelData);

    await channel.create();
    console.log(`[DEBUG] Stream: Channel ${channelId} created`);
    return channel;
  } catch (error) {
    console.error('[DEBUG] Stream: Error creating channel:', error);
    throw error;
  }
};

export { serverClient };
