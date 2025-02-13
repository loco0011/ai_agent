import express from 'express';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTE_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

// Create a new chat
router.post('/chats', async (req, res) => {
  try {
    const { name } = req.body;
    const chat = await Chat.create({ name });
    const populatedChat = await Chat.findById(chat._id)
      .populate('messages')
      .lean();
    res.json(populatedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get all chat heads with their messages
router.get('/chats', async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate({
        path: 'messages',
        options: { sort: { timestamp: 1 } }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Ensure messages array exists for each chat
    const formattedChats = chats.map(chat => ({
      ...chat,
      messages: chat.messages || []
    }));

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get messages for a specific chat
router.get('/chats/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ chatId: id })
      .sort({ timestamp: 1 })
      .lean();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message in a specific chat
router.post('/chats/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Create user message
    const userMessage = await Message.create({
      chatId: id,
      role: 'user',
      content: message
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    });

    // Create assistant message
    const assistantMessage = await Message.create({
      chatId: id,
      role: 'assistant',
      content: completion.choices[0].message.content
    });

    res.json({ response: assistantMessage.content });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Rename a chat
router.put('/chats/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await Chat.findByIdAndUpdate(req.params.id, { name });

    const updatedChat = await Chat.findById(req.params.id)
      .populate({
        path: 'messages',
        options: { sort: { timestamp: 1 } }
      })
      .lean();

    res.json(updatedChat);
  } catch (error) {
    console.error('Error renaming chat:', error);
    res.status(500).json({ error: 'Failed to rename chat' });
  }
});

// Delete a chat and its messages
router.delete('/chats/:id', async (req, res) => {
  try {
    await Message.deleteMany({ chatId: req.params.id });
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export { router as chatRouter };