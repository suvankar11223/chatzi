# Test Media Messaging - Step by Step

## What Was Fixed

1. **Backend Validation**: Now accepts messages with ONLY images (no text required)
2. **Image Preview**: Fixed image source format in input area
3. **Error Handling**: Better logging and error messages for upload failures
4. **Image Display**: Added error handling and load callbacks for images in messages

## Testing Steps

### Test 1: Send Image with Text

1. Open conversation
2. Tap the + button (add icon)
3. Select an image from gallery
4. **Check**: Image preview should appear in the + button area
5. Type some text: "Check this out"
6. Press send

**Expected Result:**
- Message appears instantly with local image
- Text shows immediately
- After 1-2 seconds, image updates to Cloudinary URL
- Receiver sees message with image

**Check Logs:**
```
=== SENDING MESSAGE ===
Has attachment: true
=== UPLOADING IMAGE ===
File URI: file:///...
✓ Image uploaded successfully!
Cloudinary URL: https://res.cloudinary.com/...
=== MESSAGE SENT ===
```

### Test 2: Send Image Only (No Text)

1. Open conversation
2. Tap the + button
3. Select an image
4. **Don't type any text**
5. Press send

**Expected Result:**
- Message appears instantly with local image
- No text content
- After 1-2 seconds, image updates to Cloudinary URL
- Receiver sees image-only message

**Check Logs:**
```
=== SENDING MESSAGE ===
Message: (empty)
Has attachment: true
=== UPLOADING IMAGE ===
✓ Image uploaded successfully!
```

### Test 3: Image Upload Fails

If Cloudinary upload fails (network issue, wrong credentials, etc.):

**With Text:**
- Shows alert: "Image upload failed, sending text only"
- Text message is sent without image

**Without Text:**
- Shows alert: "Image upload failed. Please try again."
- Message is NOT sent
- Optimistic message is removed from list

## Troubleshooting

### Issue: Image preview doesn't show after selection

**Check:**
1. Look for logs: `File URI: file:///...`
2. If no logs, image picker might have failed
3. Check permissions for photo library access

**Fix:**
- Restart app
- Check app permissions in phone settings
- Try selecting a different image

### Issue: Image uploads but doesn't display in message

**Check logs for:**
```
Image load error: ...
```

**Possible causes:**
1. Cloudinary URL is invalid
2. Image format not supported
3. Network issue loading image

**Fix:**
- Check Cloudinary configuration in `imageService.ts`
- Verify `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET`
- Test Cloudinary URL in browser

### Issue: "Image upload failed" error

**Check logs for:**
```
=== IMAGE UPLOAD FAILED ===
Error: ...
```

**Common causes:**
1. **Network error**: Phone not connected to internet
2. **Cloudinary config wrong**: Check cloud name and upload preset
3. **File too large**: Reduce image quality in picker settings
4. **Invalid file format**: Only JPEG/PNG supported

**Fix:**
1. Check internet connection
2. Verify Cloudinary settings:
   ```typescript
   CLOUDINARY_CLOUD_NAME = "dx6n5pj46"
   CLOUDINARY_UPLOAD_PRESET = "Images"
   ```
3. Try with a smaller image
4. Check Cloudinary dashboard for upload errors

### Issue: Backend rejects message

**Check backend logs for:**
```
=== NEW MESSAGE EVENT ===
Error: Missing required fields
```

**This means:**
- Message has neither content nor attachment
- Should not happen with current code

**Fix:**
- Restart backend
- Check backend validation in `chatEvents.ts`

## Expected Behavior

✓ Can select image from gallery
✓ Image preview shows in + button
✓ Can send image with text
✓ Can send image without text
✓ Message appears instantly (optimistic update)
✓ Image uploads in background
✓ Both sender and receiver see image
✓ If upload fails with text, text is sent
✓ If upload fails without text, message is cancelled

## Cloudinary Configuration

Current settings in `frontend/services/imageService.ts`:
```typescript
CLOUDINARY_CLOUD_NAME = "dx6n5pj46"
CLOUDINARY_UPLOAD_PRESET = "Images"
```

**To verify Cloudinary is working:**
1. Go to https://cloudinary.com
2. Login to your account
3. Check Dashboard > Settings > Upload
4. Verify upload preset "Images" exists
5. Make sure it's set to "Unsigned" mode

## What to Report

If images still don't work, provide:

1. **Frontend logs** when selecting image:
   - Look for: `File URI: file:///...`
   - Look for: `=== UPLOADING IMAGE ===`

2. **Upload result**:
   - Success: `✓ Image uploaded successfully!`
   - Failure: `=== IMAGE UPLOAD FAILED ===`

3. **Backend logs**:
   - Look for: `Has attachment: true`
   - Look for: Any error messages

4. **Answer these:**
   - Does image preview show after selection?
   - Do you see "Image upload failed" alert?
   - Does message send without image?
   - What does the error message say?
