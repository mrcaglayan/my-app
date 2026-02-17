export const sidebarItems = [
  // Gösterge Paneli
  {
    type: "link",
    label: "Gösterge Paneli",
    to: "/app",
    end: true,
    icon: "dashboard",
    badge: "NEW",
  },
  // Donem Islemleri
  {
    type: "section",
    title: "Donem Islemleri",
    icon: "spark",
    matchPrefix: "/app/donem-islemleri",
    items: [
      {
        label: "Acilis Fisi Olustur",
        to: "/app/acilis-fisi",
      },
    ],
  },
  // Yevmiye Kayıtları
  {
    type: "section",
    title: "Yevmiye Kayıtları",
    icon: "journal",
    badge: "3",
    matchPrefix: "/app/journal-entries",
    items: [
      {
        label: "Tediye",
        to: "/app/tediye-islemleri",
      },
      {
        label: "Tahsilat",
        to: "/app/tahsilat-islemleri",
      },
      {
        label: "Mahsup",
        to: "/app/mahusp-islemleri",
      },
    ],
  },
  // Banka Islemleri
  {
    type: "section",
    title: "Banka Islemleri",
    icon: "bank",
    matchPrefix: "/app/banka-islemleri",
    items: [
      {
        label: "Banka TanÄ±mla",
        to: "/app/banka-tanimla",
      },
      {
        label: "Banka Ä°ÅŸlemleri",
        to: "/app/banka-islemleri",
      },
    ],
  },
  // Cari İşlemler
  {
    type: "section",
    title: "Cari İşlemler",
    icon: "company",
    matchPrefix: "/app/cari-islemler",
    items: [
      {
        type: "section",
        title: "Cari İşlemler",
        icon: "company",
        matchPrefix: "/app/cari-islemler",
        items: [
          {
            label: "Alıcılar Kartı Oluştur",
            to: "/app/alici-kart-olustur",
          },
          {
            label: "Alıcılar Kartı Listesi",
            to: "/app/alici-kart-listesi",
          },
          {
            label: "Satıcılar Kartı Oluştur",
            to: "/app/satici-kart-olustur",
          },
          {
            label: "Satıcılar Kartı Listesi",
            to: "/app/satici-kart-listesi",
          },
        ],
      }],
  },
  //Stoklar
  {
    type: "section",
    title: "Stoklar",
    icon: "box",
    matchPrefix: "/app/stoklar",
    items: [
      {
        label: "Stok Kartı Oluştur",
        to: "/app/stok-karti-olustur",
      },
      {
        label: "Stok Yansıtma İşlemleri",
        to: "/app/stok-yansitma-islemleri",
      },
      {
        label: "Stok Kartı Listesi",
        to: "/app/stok-karti-listesi",
      },
    ],
  },
  // Demirbaşlar
  {
    type: "section",
    title: "Demirbaşlar",
    icon: "inventory",
    matchPrefix: "/app/demirbaslar",
    items: [
      {
        label: "Demirbaş Kartı Oluştur",
        to: "/app/demirbas-karti-olustur",
      },
      {
        label: "Demirbaş Alım İşlemleri",
        to: "/app/demirbas-alim-islemleri",
      },
      {
        label: "Demirbaş Satış İşlemleri",
        to: "/app/demirbas-satis-islemleri",
      },
      {
        label: "Amortisman Ayarları",
        to: "/app/demirbas-amortisman-ayarlar",
      }
    ],
  },
  //Dönem Sonu İşlemler
  {
    type: "section",
    title: "Dönem Sonu İşlemler",
    icon: "calendar",
    matchPrefix: "/app/donem-sonu-islemler",
    items: [
      {
        type: "section",
        title: "Aylık Dönem Sonu İşlemler",
        icon: "calendar",
        matchPrefix: "/app/donem-sonu-islemler/aylik",
        items: [
          {
            label: "Değerleme İşlemleri",
            to: "/app/donem-sonu-islemler/aylik/degerleme-islemleri",
          },
          {
            label: "Amortisman İşlemleri",
            to: "/app/donem-sonu-islemler/aylik/amortisman-islemleri",
          },
          {
            label: "Beyanname İşlemleri",
            to: "/app/donem-sonu-islemler/aylik/beyanname-islemleri",
          }
        ],
      },
      {
        type: "section",
        title: "Yıllık Dönem Sonu İşlemleri",
        icon: "calendar",
        matchPrefix: "/app/donem-sonu-islemler/yillik",
        items: [
          {
            label: "Envanter İşlemleri",
            to: "/app/donem-sonu-islemler/yillik/envanter-islemleri",
          },
          {
            label: "Kapanış İşlemleri",
            to: "/app/donem-sonu-islemler/yillik/kapanis-islemleri",
          },
          {
            label: "Yansıtma İşlemleri",
            to: "/app/donem-sonu-islemler/yillik/yansitma-islemleri",
          }
        ],
      }
    ],
  },
  //Raporlar
  {
    type: "section",
    title: "Raporlar",
    icon: "report",
    matchPrefix: "/app/raporlar",
    items: [
      {
        label: "Defter-i Kebir",
        to: "/app/defter-i-kebir",
      },
      {
        label: "Bilanço",
        to: "/app/bilanco",
      },
      {
        label: "Gelir Tablosu",
        to: "/app/gelir-tablosu",
      },
      {
        label: "Stok Raporu",
        to: "/app/stok-raporu",
      },
      {
        label: "Demirbaş Raporu",
        to: "/app/demirbas-raporu",
      },
      {
        label: "Mizan Raporu",
        to: "/app/mizan-raporu",
      }
    ],
  },
  // Ayarlar
  {
    type: "section",
    title: "Ayarlar",
    icon: "settings",
    matchPrefix: "/app/ayarlar",
    items: [
      {
        label: "Kullanıcı Yönetimi",
        to: "/app/ayarlar/kullanici-yonetimi",
      },
      {
        label: "Şirket Ayarları",
        to: "/app/ayarlar/sirket-ayarları",
      },
      {
        label: "Hesap Planı Oluştur",
        to: "/app/ayarlar/hesap-plani-olustur",
      },
      {
        label: "Hesap Planı Ayarları",
        to: "/app/ayarlar/hesap-plani-ayarları",
      },
      {
        label: "Stok Ayarları",
        to: "/app/ayarlar/stok-ayarları",
      },
      {
        label: "Demirbaş Ayarları",
        to: "/app/ayarlar/demirbas-ayarları",
      }
    ],
  },
];
