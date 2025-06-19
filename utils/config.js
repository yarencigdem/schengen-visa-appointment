import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

// Config dosyasını oku
export const readConfig = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(configData);
    }
    return {
      telegram: {
        botToken: "",
        chatId: "",
        enabled: false
      },
      settings: {
        defaultCountry: "fra",
        defaultFrequency: 5
      }
    };
  } catch (error) {
    console.error('Config dosyası okunamadı:', error);
    return {
      telegram: {
        botToken: "",
        chatId: "",
        enabled: false
      },
      settings: {
        defaultCountry: "fra",
        defaultFrequency: 5
      }
    };
  }
};

// Config dosyasını yaz
export const writeConfig = (config) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Config dosyası yazılamadı:', error);
    return false;
  }
};

// Telegram ayarlarını güncelle
export const updateTelegramConfig = (botToken, chatId, enabled) => {
  const config = readConfig();
  config.telegram = {
    botToken: botToken || "",
    chatId: chatId || "",
    enabled: enabled || false
  };
  return writeConfig(config);
};

// Ayarları güncelle
export const updateSettings = (settings) => {
  const config = readConfig();
  config.settings = {
    ...config.settings,
    ...settings
  };
  return writeConfig(config);
}; 