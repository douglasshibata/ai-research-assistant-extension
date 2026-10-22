import { getGeminiResponse } from './services/gemini.ts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const chatContainer = document.getElementById('chat-container') as HTMLDivElement;
const userInput = document.getElementById('user-input') as HTMLTextAreaElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const settingsView = document.getElementById('settings-view') as HTMLDivElement;
const apiKeyInput = document.getElementById('api-key-input') as HTMLInputElement;
const saveKeyBtn = document.getElementById('save-key-btn') as HTMLButtonElement;
const selectionPreview = document.getElementById('selection-preview') as HTMLDivElement;
const clearSelectionBtn = document.getElementById('clear-selection') as HTMLButtonElement;
const messageTemplate = document.getElementById('message-template') as HTMLTemplateElement;

let currentSelection = '';
let messages: Message[] = [];
let apiKey = '';

// Initialize
async function init() {
  const result = await chrome.storage.local.get(['chat_history', 'gemini_api_key']);

  if (result.gemini_api_key) {
    apiKey = result.gemini_api_key;
    apiKeyInput.value = apiKey;
  } else {
    settingsView.classList.remove('hidden');
  }

  if (result.chat_history) {
    messages = result.chat_history;
    messages.forEach(renderMessage);
  }

  // Listen for selection changes from content script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SELECTION_CHANGE') {
      currentSelection = message.selection;
      updateSelectionUI();
    }
  });

  // Initial check
  checkSelection();
}

async function checkSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' });
    if (response?.selection) {
      currentSelection = response.selection;
      updateSelectionUI();
    }
  } catch (err) {
    // Content script might not be injected yet
  }
}

function updateSelectionUI() {
  if (currentSelection) {
    selectionPreview.classList.remove('hidden');
    const snippet = selectionPreview.querySelector('.italic') as HTMLDivElement;
    snippet.textContent = `"${currentSelection}"`;
  } else {
    selectionPreview.classList.add('hidden');
  }
}

function addMessage(role: 'user' | 'assistant', content: string) {
  const message: Message = {
    role,
    content,
    timestamp: Date.now()
  };
  messages.push(message);
  renderMessage(message);
  saveMessages();
}

function renderMessage(msg: Message) {
  const clone = messageTemplate.content.cloneNode(true) as DocumentFragment;
  const messageDiv = clone.querySelector('.message') as HTMLDivElement;
  const contentDiv = clone.querySelector('.content') as HTMLDivElement;
  const timeSpan = clone.querySelector('.time') as HTMLSpanElement;

  contentDiv.textContent = msg.content;
  timeSpan.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (msg.role === 'user') {
    messageDiv.classList.add('self-end');
    contentDiv.classList.add('bg-indigo-600', 'text-white', 'rounded-br-none');
  } else {
    messageDiv.classList.add('self-start');
    contentDiv.classList.add('bg-white', 'text-slate-700', 'border', 'border-slate-200', 'rounded-bl-none');
  }

  chatContainer.appendChild(clone);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function saveMessages() {
  chrome.storage.local.set({ chat_history: messages });
}

async function getPageContext(): Promise<string> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return '';
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTEXT' });
    return response?.context || '';
  } catch (err) {
    return '';
  }
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text && !currentSelection) return;

  if (!apiKey) {
    settingsView.classList.remove('hidden');
    alert('Please enter your Gemini API key first.');
    return;
  }

  let prompt = text;
  if (currentSelection) {
    prompt = `The user has highlighted this text: "${currentSelection}"\n\nUser Question: ${text || 'Tell me more about this.'}`;
  }

  addMessage('user', text || `Analyze selection: "${currentSelection.slice(0, 30)}..."`);
  userInput.value = '';
  userInput.style.height = 'auto';

  currentSelection = '';
  updateSelectionUI();

  const thinkingId = showThinking();

  try {
    const context = await getPageContext();
    const response = await getGeminiResponse(prompt, context, apiKey);
    removeThinking(thinkingId);
    addMessage('assistant', response);
  } catch (err: any) {
    removeThinking(thinkingId);
    addMessage('assistant', 'Error: ' + (err.message || 'Failed to get response.'));
    console.error(err);
  }
}

function showThinking() {
  const id = 'thinking-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'message self-start flex flex-col max-w-[85%]';
  div.innerHTML = `
    <div class="content p-3 rounded-2xl text-sm shadow-sm bg-white text-slate-400 border border-slate-200 rounded-bl-none italic flex items-center gap-2">
        <svg class="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Thinking...
    </div>
  `;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return id;
}

function removeThinking(id: string) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Event Listeners
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear chat history?')) {
    messages = [];
    chatContainer.innerHTML = '';
    chrome.storage.local.remove('chat_history');
  }
});

settingsBtn.addEventListener('click', () => {
  settingsView.classList.toggle('hidden');
});

saveKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    apiKey = key;
    await chrome.storage.local.set({ gemini_api_key: key });
    settingsView.classList.add('hidden');
    alert('API Key saved!');
  }
});

clearSelectionBtn.addEventListener('click', () => {
  currentSelection = '';
  updateSelectionUI();
});

userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = userInput.scrollHeight + 'px';
});

init();
