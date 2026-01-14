import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header } from '../../components';
import { mockUsers, mockChatMessages } from '../../data/mockData';
import { User, ChatMessage } from '../../types';

export const TeacherChat: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Get users to chat with (other teachers, parents, admins - excluding self)
  const chatUsers = mockUsers.filter((u) => u.id !== user?.id);

  const getConversationMessages = (userId: string) => {
    return messages.filter(
      (m) =>
        (m.senderId === user?.id && m.receiverId === userId) ||
        (m.senderId === userId && m.receiverId === user?.id)
    );
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: ChatMessage = {
      id: `msg${Date.now()}`,
      senderId: user?.id || '',
      senderName: user?.name || '',
      senderNameAr: user?.nameAr || '',
      receiverId: selectedUser.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'معلمة';
      case 'parent':
        return 'ولي أمر';
      case 'admin':
        return 'مدير';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string): keyof typeof Ionicons.glyphMap => {
    switch (role) {
      case 'teacher':
        return 'school';
      case 'parent':
        return 'people';
      case 'admin':
        return 'shield-checkmark';
      default:
        return 'person';
    }
  };

  if (!selectedUser) {
    return (
      <View style={styles.container}>
        <Header showLogout />
        <View style={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('conversations')}
          </Text>
          
          {chatUsers.map((chatUser) => {
            const unread = messages.filter(
              (m) => m.senderId === chatUser.id && m.receiverId === user?.id && !m.read
            ).length;
            const lastMessage = getConversationMessages(chatUser.id).slice(-1)[0];

            return (
              <TouchableOpacity
                key={chatUser.id}
                style={[styles.userItem, isRTL && styles.userItemRTL]}
                onPress={() => setSelectedUser(chatUser)}
              >
                <View style={styles.userAvatar}>
                  <Ionicons name={getRoleIcon(chatUser.role)} size={22} color={colors.textLight} />
                </View>
                <View style={styles.userInfo}>
                  <View style={[styles.userHeader, isRTL && styles.userHeaderRTL]}>
                    <Text style={[styles.userName, isRTL && styles.textRTL]}>
                      {chatUser.nameAr || chatUser.name}
                    </Text>
                    <Text style={styles.roleBadge}>{getRoleLabel(chatUser.role)}</Text>
                  </View>
                  {lastMessage && (
                    <Text
                      style={[styles.lastMessage, isRTL && styles.textRTL]}
                      numberOfLines={1}
                    >
                      {lastMessage.content}
                    </Text>
                  )}
                </View>
                {unread > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.accentYellow }]}>
                    <Text style={styles.unreadText}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  const conversationMessages = getConversationMessages(selectedUser.id);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header showLogout />
      
      {/* Chat Header */}
      <View style={[styles.chatHeader, isRTL && styles.chatHeaderRTL]}>
        <TouchableOpacity
          onPress={() => setSelectedUser(null)}
          style={styles.backButton}
        >
          <Ionicons 
            name={isRTL ? 'arrow-forward' : 'arrow-back'} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        <View style={[styles.chatUserInfo, isRTL && styles.chatUserInfoRTL]}>
          <Text style={[styles.chatUserName, isRTL && styles.textRTL]}>
            {selectedUser.nameAr || selectedUser.name}
          </Text>
          <Text style={[styles.chatUserRole, isRTL && styles.textRTL]}>
            {getRoleLabel(selectedUser.role)}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {conversationMessages.length === 0 ? (
          <View style={styles.noMessages}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.border} />
            <Text style={styles.noMessagesText}>{t('noMessages')}</Text>
          </View>
        ) : (
          conversationMessages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  isMine ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myMessageText : styles.theirMessageText,
                  ]}
                >
                  {msg.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isMine ? styles.myMessageTime : styles.theirMessageTime,
                  ]}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
        <TextInput
          style={[styles.input, isRTL && styles.inputRTL]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={t('typeMessage')}
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  textRTL: {
    textAlign: 'right',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  userItemRTL: {
    flexDirection: 'row-reverse',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  roleBadge: {
    fontSize: 10,
    color: colors.textLight,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  chatHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 8,
  },
  chatUserInfo: {
    flex: 1,
  },
  chatUserInfoRTL: {
    alignItems: 'flex-end',
  },
  chatUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  chatUserRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 8,
  },
  noMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noMessagesText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.textLight,
  },
  theirMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  inputContainerRTL: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  inputRTL: {
    textAlign: 'right',
  },
  sendButton: {
    backgroundColor: colors.accentBlue,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
