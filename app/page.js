"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { playNotification } from "../public/notification";
import { months, countryTr, countries, countryCodeMapping } from "./store/enums";

// Config dosyasını oku (client-side için basit versiyon)
const readConfig = () => {
  try {
    // Client-side'da dosya okuma yapamayız, bu yüzden localStorage kullanacağız
    // Ama config.json'dan başlangıç değerlerini alabiliriz
    const savedData = localStorage.getItem('appConfig');
    if (savedData) {
      return JSON.parse(savedData);
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
    console.log("Config okunamadı:", error.message);
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

// Config dosyasını yaz (client-side için basit versiyon)
const writeConfig = (config) => {
  try {
    localStorage.setItem('appConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.log("Config yazılamadı:", error.message);
    return false;
  }
};

export default function Home() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [country, setCountry] = useState("fra");
  const [center, setCenter] = useState("all"); // Tüm merkezler
  const [visaCategory, setVisaCategory] = useState("all"); // Tüm vize türleri
  const [frequency, setFrequency] = useState(5);
  const [isChecking, setIsChecking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Program bekleme durumunda...");
  const [useTelegram, setUseTelegram] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [availableCenters, setAvailableCenters] = useState([]); // Mevcut merkezler
  const [availableVisaCategories, setAvailableVisaCategories] = useState([]); // Mevcut vize türleri

  // Mesaj alanı için ref oluşturuyoruz
  const messageHistoryRef = useRef(null);

  // Telegram bilgilerini config dosyasından yükle
  useEffect(() => {
    try {
      const config = readConfig();
      setBotToken(config.telegram.botToken || "");
      setChatId(config.telegram.chatId || "");
      setUseTelegram(config.telegram.enabled || false);
    } catch (error) {
      console.log("Telegram bilgileri yüklenemedi:", error.message);
    }
  }, []);

  // Telegram bilgilerini config dosyasına kaydet
  const saveTelegramData = useCallback(() => {
    try {
      const config = readConfig();
      const newConfig = {
        ...config,
        telegram: {
          botToken,
          chatId,
          enabled: useTelegram
        }
      };
      writeConfig(newConfig);
    } catch (error) {
      console.log("Telegram bilgileri kaydedilemedi:", error.message);
    }
  }, [botToken, chatId, useTelegram]);

  // Telegram bilgileri değiştiğinde otomatik kaydet
  useEffect(() => {
    saveTelegramData();
  }, [botToken, chatId, useTelegram, saveTelegramData]);

  // Mesajlar değiştiğinde otomatik scroll
  useEffect(() => {
    if (messageHistoryRef.current) {
      messageHistoryRef.current.scrollTop = 0; // En üste scroll
    }
  }, [messages]);

  // Ülke değiştiğinde merkezleri güncelle
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await fetch(
          "https://api.visasbot.com/api/visa/list",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.visas) {
            const appointments = result.data.visas;
            const countryAppointments = appointments.filter((appointment) => {
              if (
                !appointment.country_code ||
                !appointment.mission_code ||
                !appointment.center
              ) {
                return false;
              }
              const isFromTurkey = appointment.country_code.toLowerCase() === "tur";
              const isTargetCountry = appointment.mission_code.toLowerCase() === country.toLowerCase();
              return isFromTurkey && isTargetCountry;
            });
            
            const centers = [...new Set(countryAppointments.map(appt => appt.center))];
            setAvailableCenters(centers);
            
            // Ülke değiştiğinde tüm vize türlerini göster
            const categories = [...new Set(countryAppointments.map(appt => appt.visa_category))];
            setAvailableVisaCategories(categories);
          }
        }
      } catch (error) {
        console.log("Merkez ve vize türü bilgileri alınamadı:", error.message);
      }
    };

    fetchCenters();
  }, [country]);

  // Merkez değiştiğinde o merkeze ait vize türlerini güncelle
  useEffect(() => {
    const fetchVisaCategories = async () => {
      if (center === "all") {
        // Tüm merkezler seçiliyse, ülke bazlı vize türlerini göster
        return;
      }

      try {
        const response = await fetch(
          "https://api.visasbot.com/api/visa/list",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.visas) {
            const appointments = result.data.visas;
            const centerAppointments = appointments.filter((appointment) => {
              if (
                !appointment.country_code ||
                !appointment.mission_code ||
                !appointment.center
              ) {
                return false;
              }
              const isFromTurkey = appointment.country_code.toLowerCase() === "tur";
              const isTargetCountry = appointment.mission_code.toLowerCase() === country.toLowerCase();
              const isTargetCenter = appointment.center === center;
              return isFromTurkey && isTargetCountry && isTargetCenter;
            });
            
            const categories = [...new Set(centerAppointments.map(appt => appt.visa_category))];
            setAvailableVisaCategories(categories);
          }
        }
      } catch (error) {
        console.log("Vize türü bilgileri alınamadı:", error.message);
      }
    };

    fetchVisaCategories();
  }, [country, center]);

  const addMessage = useCallback((type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [newMessage, ...prev].slice(0, 100));
  }, []);

  const stopChecking = useCallback(() => {
    setIsChecking(false);
    setStatus("Program bekleme durumunda...");
  }, []);

  const sendTelegramMessage = useCallback(
    async (message) => {
      if (!useTelegram || message === null) return;

      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            `Telegram hatası: ${error.description || "Bilinmeyen hata"}`
          );
        }
      } catch (error) {
        addMessage("error", `Telegram hatası: ${error.message}`);

        if (error.message.includes("Telegram hatası")) {
          stopChecking();
          addMessage(
            "error",
            "Telegram hatası nedeniyle kontroller durduruldu. Lütfen bot token ve chat ID'nizi kontrol edin."
          );
        }
      }
    },
    [botToken, chatId, addMessage, stopChecking, useTelegram]
  );

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) {
      return "Tarih bilgisi mevcut değil";
    }

    try {
      const [year, month, day] = dateStr.split("-");
      if (!year || !month || !day || !months[month]) {
        throw new Error("Geçersiz tarih formatı");
      }
      return `${day} ${months[month]} ${year}`;
    } catch (error) {
      return "Geçersiz tarih formatı";
    }
  }, []);

  const formatAppointmentMessage = useCallback(
    (appointments) => {
      if (appointments.length === 0) return null;

      // Her randevu için ayrı mesaj oluştur
      const messages = appointments.map((appt) => {
        let message = `🎉 *${countryTr[countryCodeMapping[country]] || country} için randevu bulundu!*\n\n`;
        
        message += `🏢 *Konsolosluk Merkezi:*\n`;
        message += `   ${appt.center || "Belirtilmemiş"}\n\n`;
        
        message += `📋 *Vize Kategorisi:*\n`;
        message += `   ${appt.visa_category || "Belirtilmemiş"}\n\n`;
        
        message += `📝 *Vize Tipi:*\n`;
        message += `   ${appt.visa_type || "Belirtilmemiş"}\n\n`;
        
        message += `📊 *Durum:*\n`;
        message += `   ${appt.status === "open" ? "🟢 Açık" : "🟡 Bekleme Listesi Açık"}\n\n`;
        
        if (appt.last_available_date) {
          message += `📅 *Son Müsait Tarih:*\n`;
          message += `   ${appt.last_available_date}\n\n`;
        }
        
        if (appt.last_open_at) {
          const openDate = new Date(appt.last_open_at);
          message += `🕐 *Son Açılış Zamanı:*\n`;
          message += `   ${openDate.toLocaleString('tr-TR')}\n\n`;
        }
        
        message += `👥 *Takip Sayısı:* ${appt.tracking_count || 0}\n`;
        message += `🆔 *Randevu ID:* ${appt.id}\n`;
        
        message += `\n💡 *Önemli:* Bu randevu için hemen başvuru yapmanız önerilir!\n`;
        
        return message;
      });
      
      return messages;
    },
    [country]
  );

  const showWebNotification = useCallback((message, type = "success") => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  }, []);

  const checkAppointments = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.visasbot.com/api/visa/list",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `API yanıt vermedi (${response.status}): ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success || !result.data || !result.data.visas) {
        throw new Error("API yanıtı beklenen formatta değil");
      }

      const appointments = result.data.visas;

      // Türkiye'den seçilen ülkeye giden randevuları filtrele
      const countryAppointments = appointments.filter((appointment) => {
        if (
          !appointment.country_code ||
          !appointment.mission_code ||
          !appointment.center ||
          !appointment.status
        ) {
          return false;
        }

        // Türkiye'den (tur) seçilen ülkeye giden randevular
        const isFromTurkey = appointment.country_code.toLowerCase() === "tur";
        const isTargetCountry = appointment.mission_code.toLowerCase() === country.toLowerCase();
        const isOpenOrWaitlist = appointment.status === "open" || appointment.status === "waitlist_open";
        
        return isFromTurkey && isTargetCountry && isOpenOrWaitlist;
      });

      // Mevcut merkezleri güncelle
      const centers = [...new Set(countryAppointments.map(appt => appt.center))];
      setAvailableCenters(centers);

      // Merkez filtrelemesi uygula
      let filteredAppointments = center === "all" 
        ? countryAppointments 
        : countryAppointments.filter(appt => appt.center === center);

      // Vize türü filtrelemesi uygula
      filteredAppointments = visaCategory === "all"
        ? filteredAppointments
        : filteredAppointments.filter(appt => appt.visa_category === visaCategory);

      if (filteredAppointments.length > 0) {
        const messages = formatAppointmentMessage(filteredAppointments);
        if (useTelegram) {
          for (const message of messages) {
            await sendTelegramMessage(message);
          }
        }
        
        // Her randevu için ayrı mesaj ekle
        for (const message of messages) {
          addMessage("appointment", message);
        }
        
        showWebNotification(`${filteredAppointments.length} adet randevu bulundu!`);

        try {
          await playNotification();
        } catch (error) {
          addMessage("error", "Ses bildirimi çalınamadı");
        }
      } else {
        const centerText = center === "all" ? "" : ` - ${center}`;
        const categoryText = visaCategory === "all" ? "" : ` - ${visaCategory}`;
        const statusMessage = `Kontrol edildi: ${
          countryTr[countryCodeMapping[country]] || country
        }${centerText}${categoryText} (Randevu bulunamadı)`;
        addMessage("status", statusMessage);
        showWebNotification(statusMessage, "info");
      }
    } catch (error) {
      addMessage("error", `Hata: ${error.message}`);
      showWebNotification(error.message, "error");

      if (error.message.includes("API yanıt vermedi")) {
        stopChecking();
        addMessage(
          "error",
          "API hatası nedeniyle kontroller durduruldu. Lütfen daha sonra tekrar deneyin."
        );
      }
    }
  }, [
    country,
    center,
    visaCategory,
    formatAppointmentMessage,
    sendTelegramMessage,
    addMessage,
    stopChecking,
    useTelegram,
    showWebNotification,
  ]);

  const startChecking = useCallback(() => {
    if (useTelegram && (!botToken || !chatId)) {
      addMessage(
        "error",
        "Telegram bildirimleri açıkken bot token ve chat ID zorunludur!"
      );
      return;
    }

    if (frequency < 1 || frequency > 3600) {
      addMessage("error", "Kontrol sıklığı 1-3600 saniye arasında olmalıdır!");
      return;
    }

    setIsChecking(true);
    const centerText = center === "all" ? "" : ` - ${center}`;
    const categoryText = visaCategory === "all" ? "" : ` - ${visaCategory}`;
    setStatus(`${countryTr[countryCodeMapping[country]] || country}${centerText}${categoryText} için randevu kontrolü başlatıldı`);
    checkAppointments();
  }, [
    botToken,
    chatId,
    country,
    center,
    visaCategory,
    frequency,
    checkAppointments,
    addMessage,
    useTelegram,
  ]);

  useEffect(() => {
    let interval;
    if (isChecking) {
      interval = setInterval(checkAppointments, frequency * 1000);
    }
    return () => clearInterval(interval);
  }, [isChecking, frequency, checkAppointments]);

  return (
    <div className="container">
      {/* Header Section */}
      <header className="header-section">
        <h1 className="title">
          <i className="fas fa-passport"></i>
          Schengen Vizesi Randevu Arama
          <i className="fas fa-passport"></i>

        </h1>
        
        <p className="subtitle">
          Otomatik randevu kontrolü ve anlık bildirim sistemi
        </p>
        
      </header>

      {/* Telegram Settings Card */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">
            <div className="card-title-text">
              <i className="fas fa-robot"></i>
              Telegram Bildirimleri
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="telegram-toggle"
                checked={useTelegram}
                onChange={(e) => {
                  setUseTelegram(e.target.checked);
                  if (!e.target.checked && isChecking) {
                    stopChecking();
                    addMessage(
                      "status",
                      "Telegram bildirimleri kapatıldığı için kontrol durduruldu."
                    );
                  }
                }}
              />
              <label
                htmlFor="telegram-toggle"
                className="toggle-slider"
              ></label>
            </div>
          </h2>

          {useTelegram && (
            <div className="telegram-inputs">
              <div className="form-group">
                <label>
                  <i className="fas fa-key"></i>
                  Bot Token
                </label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Bot Father'dan aldığınız token"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-id-card"></i>
                  Chat ID
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Telegram chat ID'niz"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Settings Card */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">
            <div className="card-title-text">
              <i className="fas fa-cog"></i>
              Randevu Ayarları
            </div>
          </h2>
          <div className="settings-inputs">
            <div className="form-group">
              <label>
                <i className="fas fa-globe"></i>
                Ülke
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCenter("all"); // Ülke değiştiğinde merkezi sıfırla
                  setVisaCategory("all"); // Ülke değiştiğinde vize türünü sıfırla
                  if (isChecking) {
                    stopChecking();
                    addMessage(
                      "status",
                      "Ülke değiştirildiği için kontrol durduruldu."
                    );
                  }
                }}
              >
                {countries.map((item, index) => {
                  return (
                    <option key={index} value={item?.value}>
                      {item?.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-building"></i>
                Randevu Merkezi
              </label>
              <select
                value={center}
                onChange={(e) => {
                  setCenter(e.target.value);
                  if (isChecking) {
                    stopChecking();
                    addMessage(
                      "status",
                      "Merkez değiştirildiği için kontrol durduruldu."
                    );
                  }
                }}
                disabled={availableCenters.length === 0}
              >
                <option value="all">Tüm Merkezler</option>
                {availableCenters.map((centerName, index) => (
                  <option key={index} value={centerName}>
                    {centerName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-passport"></i>
                Vize Türü
              </label>
              <select
                value={visaCategory}
                onChange={(e) => {
                  setVisaCategory(e.target.value);
                  if (isChecking) {
                    stopChecking();
                    addMessage(
                      "status",
                      "Vize türü değiştirildiği için kontrol durduruldu."
                    );
                  }
                }}
                disabled={availableVisaCategories.length === 0}
              >
                <option value="all">Tüm Vize Türleri</option>
                {availableVisaCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-clock"></i>
                Kontrol Sıklığı (saniye)
              </label>
              <input
                type="number"
                value={frequency}
                onChange={(e) => {
                  setFrequency(parseInt(e.target.value));
                  if (isChecking) {
                    stopChecking();
                    addMessage(
                      "status",
                      "Kontrol sıklığı değiştirildiği için kontrol durduruldu."
                    );
                  }
                }}
                min="1"
                max="3600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Section */}
      <div className="control-section">
        <div className="button-group">
          <button
            className={`btn ${isChecking ? "btn-danger" : "btn-primary"}`}
            onClick={isChecking ? stopChecking : startChecking}
          >
            <i className={`fas ${isChecking ? "fa-stop" : "fa-play"}`}></i>
            {isChecking ? "Kontrolü Durdur" : "Kontrolü Başlat"}
          </button>
        </div>

        <div
          className={`status ${isChecking ? "running" : "stopped"}`}
          id="status-container"
        >
          <i className="fas fa-info-circle" id="status-icon"></i>
          <p id="status-text">{status}</p>
        </div>
      </div>

      {/* Message History Card */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">
            <div className="card-title-text">
              <i className="fas fa-history"></i>
              {useTelegram ? "Telegram Mesaj Geçmişi" : "Bulunan Randevular"}
            </div>
            <div className="message-count">
              {messages.length} mesaj
            </div>
          </h2>
          <div className="message-history" ref={messageHistoryRef}>
            {messages.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Henüz mesaj bulunmuyor</p>
                <span>Kontrol başlattığınızda burada mesajlar görünecek</span>
              </div>
            ) : (
              messages.slice().map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-time">
                    <i className="fas fa-clock"></i>
                    {message.timestamp}
                  </div>
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  ></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="notification">
          <div className="notification-content">
            <div className="notification-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="notification-message">{notificationMessage}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>
          <i className="fas fa-shield-alt"></i>
          Güvenli ve anonim randevu kontrolü
        </p>
        <p>
          <i className="fas fa-heart"></i>
          Türkiye'den Schengen vizesi almak isteyenler için
        </p>
      </footer>
    </div>
  );
}
