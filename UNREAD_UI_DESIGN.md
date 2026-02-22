# 🎨 Unread Messages UI Design

## Visual Hierarchy

### Without Unread Messages
```
┌─────────────────────────────────────────┐
│  👤  John Doe                    2:30 PM │
│      Hey, how are you?                   │
└─────────────────────────────────────────┘
```
- Regular font weight (600)
- Gray text for message preview
- Gray timestamp

### With Unread Messages
```
┌─────────────────────────────────────────┐
│  👤  John Doe              🔵 3    2:30 PM │
│      Hey, how are you?                   │
└─────────────────────────────────────────┘
```
- Bold font weight (700)
- Dark text for message preview
- Primary color timestamp
- Unread badge on right

---

## Badge Design

### Small Count (1-9)
```
┌────┐
│ 3  │  22x22px, circular
└────┘
```

### Medium Count (10-99)
```
┌─────┐
│ 42  │  Auto-width, min 22px
└─────┘
```

### Large Count (100+)
```
┌──────┐
│ 99+  │  Shows "99+" for any count > 99
└──────┘
```

---

## Color Scheme

### Unread State
- **Badge Background:** `colors.primary` (your app's primary color)
- **Badge Text:** `colors.white`
- **Name:** `colors.neutral900` (dark, bold)
- **Message Preview:** `colors.neutral900` (dark, bold)
- **Timestamp:** `colors.primary` (highlighted)

### Read State
- **Name:** `colors.neutral900` (dark, regular)
- **Message Preview:** `colors.neutral600` (gray, regular)
- **Timestamp:** `colors.neutral600` (gray)

---

## Typography

### Conversation Name
```typescript
// Unread
<Typo size={17} fontWeight="700">John Doe</Typo>

// Read
<Typo size={17} fontWeight="600">John Doe</Typo>
```

### Message Preview
```typescript
// Unread
<Typo size={15} fontWeight="600" color={colors.neutral900}>
  Hey, how are you?
</Typo>

// Read
<Typo size={15} fontWeight="400" color={colors.neutral600}>
  Hey, how are you?
</Typo>
```

### Timestamp
```typescript
// Unread
<Typo size={13} fontWeight="600" color={colors.primary}>
  2:30 PM
</Typo>

// Read
<Typo size={13} fontWeight="400" color={colors.neutral600}>
  2:30 PM
</Typo>
```

### Badge Count
```typescript
<Typo size={12} fontWeight="700" color={colors.white}>
  {unreadCount > 99 ? '99+' : unreadCount}
</Typo>
```

---

## Layout Structure

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│  ┌────┐  ┌──────────────────────────┐  ┌──────────┐ │
│  │    │  │ John Doe                 │  │ 🔵 3     │ │
│  │ 👤 │  │                          │  │ 2:30 PM  │ │
│  │    │  │ Hey, how are you?        │  │          │ │
│  └────┘  └──────────────────────────┘  └──────────┘ │
│  47px    Flex: 1                        Auto-width   │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### Spacing
- **Avatar Size:** 47px
- **Gap between avatar and content:** 12px
- **Horizontal padding:** 20px
- **Vertical padding:** 12px
- **Badge min-width:** 22px
- **Badge height:** 22px
- **Badge border-radius:** 11px (circular)
- **Badge horizontal padding:** 6px

---

## Message Type Indicators

### Text Message
```
Hey, how are you?
```

### Image Message
```
📷 Image
```

### No Messages Yet
```
Say hi 👋
```

---

## Responsive Behavior

### Long Names
```
┌─────────────────────────────────────────┐
│  👤  John Doe With A Very Lo...  🔵 3   │
│      Hey, how are you?                   │
└─────────────────────────────────────────┘
```
- Name truncates with ellipsis
- Badge always visible

### Long Messages
```
┌─────────────────────────────────────────┐
│  👤  John Doe                    🔵 3    │
│      This is a very long messa...        │
└─────────────────────────────────────────┘
```
- Message preview truncates to 1 line
- Badge always visible

### Large Unread Count
```
┌─────────────────────────────────────────┐
│  👤  John Doe                  🔵 99+    │
│      Hey, how are you?                   │
└─────────────────────────────────────────┘
```
- Shows "99+" for counts > 99
- Badge expands to fit text

---

## Animation & Transitions

### When New Message Arrives
1. Conversation smoothly moves to top
2. Badge appears/updates instantly
3. Text becomes bold
4. Colors change to unread state

### When Opening Conversation
1. Badge fades out
2. Text weight returns to normal
3. Colors return to read state

### Smooth Transitions
```typescript
// No explicit animations needed
// React Native handles list reordering smoothly
// State changes trigger instant re-renders
```

---

## Accessibility

### Screen Reader Support
- Badge count announced: "3 unread messages"
- Conversation name announced first
- Message preview announced second
- Timestamp announced last

### Touch Target
- Entire conversation item is tappable
- Minimum touch target: 48px height
- Clear visual feedback on press

### Color Contrast
- Badge: High contrast (white on primary)
- Text: WCAG AA compliant
- Readable in light and dark modes

---

## Dark Mode Support

### Unread State (Dark Mode)
- **Badge:** Same primary color
- **Name:** `colors.white` or `colors.neutral100`
- **Message:** `colors.neutral200`
- **Timestamp:** `colors.primary`

### Read State (Dark Mode)
- **Name:** `colors.neutral200`
- **Message:** `colors.neutral400`
- **Timestamp:** `colors.neutral400`

---

## Comparison with WhatsApp

### Similarities ✅
- Badge on right side
- Bold text for unread
- Auto-sort by latest message
- Badge shows count
- "99+" for large counts

### Differences
- WhatsApp uses green badge
- We use your app's primary color
- WhatsApp shows checkmarks
- We focus on unread count

---

## Code Example

```typescript
const ConversationItem = ({ item }) => {
  const unreadCount = item.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  return (
    <TouchableOpacity style={styles.container}>
      <Avatar uri={avatar} size={47} />
      
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          {/* Name - Bold if unread */}
          <Typo size={17} fontWeight={hasUnread ? "700" : "600"}>
            {name}
          </Typo>
          
          {/* Timestamp - Primary color if unread */}
          <Typo 
            size={13} 
            color={hasUnread ? colors.primary : colors.neutral600}
            fontWeight={hasUnread ? "600" : "400"}
          >
            {timestamp}
          </Typo>
        </View>
        
        <View style={styles.row}>
          {/* Message - Bold if unread */}
          <Typo
            size={15}
            color={hasUnread ? colors.neutral900 : colors.neutral600}
            fontWeight={hasUnread ? "600" : "400"}
            style={{ flex: 1 }}
          >
            {message}
          </Typo>
          
          {/* Badge - Only if unread */}
          {hasUnread && (
            <View style={styles.badge}>
              <Typo size={12} fontWeight="700" color={colors.white}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Typo>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.primary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
});
```

---

## 🎯 Design Principles

1. **Clarity:** Unread messages are immediately obvious
2. **Consistency:** Same design for direct and group chats
3. **Efficiency:** No unnecessary animations or delays
4. **Accessibility:** Works for all users
5. **Professional:** Matches industry standards (WhatsApp, Telegram)

---

## 📱 Platform Considerations

### iOS
- Uses SF Pro font (system default)
- Smooth animations
- Native feel

### Android
- Uses Roboto font (system default)
- Material Design principles
- Native feel

### Both
- Same badge design
- Same color scheme
- Same behavior
- Consistent experience

---

Your UI now looks professional and polished! 🎨✨
