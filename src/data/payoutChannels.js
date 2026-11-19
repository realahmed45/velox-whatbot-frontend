// Where Botlify can send automatic payouts (Xendit channel codes, Indonesia).
export const PAYOUT_CHANNELS = [
  { code: "ID_BCA", label: "BCA" },
  { code: "ID_MANDIRI", label: "Mandiri" },
  { code: "ID_BRI", label: "BRI" },
  { code: "ID_BNI", label: "BNI" },
  { code: "ID_BSI", label: "BSI (Bank Syariah Indonesia)" },
  { code: "ID_CIMB", label: "CIMB Niaga" },
  { code: "ID_PERMATA", label: "Permata" },
  { code: "ID_DANAMON", label: "Danamon" },
  { code: "ID_BPD_BALI", label: "BPD Bali" },
  { code: "ID_JAGO", label: "Bank Jago" },
  { code: "ID_SEABANK", label: "SeaBank" },
  { code: "ID_GOPAY", label: "GoPay (e-wallet)" },
  { code: "ID_OVO", label: "OVO (e-wallet)" },
  { code: "ID_DANA", label: "DANA (e-wallet)" },
  { code: "ID_SHOPEEPAY", label: "ShopeePay (e-wallet)" },
  { code: "ID_LINKAJA", label: "LinkAja (e-wallet)" },
];

export const channelLabel = (code) =>
  PAYOUT_CHANNELS.find((c) => c.code === code)?.label || code || "";
