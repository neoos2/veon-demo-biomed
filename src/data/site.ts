// All facts come from veon/client.json (company.contacts, business_lines, products_services, B-001…B-014).
// Nothing here is invented: no prices, numbers or reviews.

export const FUTURE = "Розділ в розробці";

export interface Phone {
  display: string; // as written by the client
  e164: string; // digits for tel:, viber, wa.me
  messengers: boolean; // Viber + WhatsApp marked next to the number
  note?: string;
}

const phone = (display: string, messengers = false, note?: string): Phone => ({
  display,
  e164: "+38" + display.replace(/\D/g, ""),
  messengers,
  note,
});

export const MAIN = phone("(066) 011-59-93", true);
export const CLINIC_LINE = phone("(044) 422-55-66", false, "для закладів");

export const SALES: Phone[] = [
  MAIN,
  CLINIC_LINE,
  phone("(050) 414-14-42", true),
  phone("(095) 271-05-46", true),
  phone("(066) 892-76-58", true),
  phone("(050) 330-94-02"),
];

export const SERVICE: Phone[] = [
  phone("(050) 414-14-43"),
  phone("(067) 581-43-43"),
  phone("(044) 422-55-70"),
];

export const EMAIL = "info@biomed.ua";
export const SERVICE_EMAIL = "service@biomed.ua";
export const ADDRESS = "03164, м. Київ, пр-т Палладіна, 25";
export const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Київ, проспект Академіка Палладіна, 25");
export const YOUTUBE = "https://www.youtube.com/@biomedua379";

export const tel = (p: Phone) => `tel:${p.e164}`;
export const viber = (p: Phone) => `viber://chat?number=${encodeURIComponent(p.e164)}`;
export const whatsapp = (p: Phone) => `https://wa.me/${p.e164.replace("+", "")}`;

export const RFQ_FIELDS = [
  "Заклад:",
  "Місто:",
  "Обладнання і кількість:",
  "Код ДК (якщо є):",
  "Контактна особа і телефон:",
];

export const RFQ_MAILTO =
  `mailto:${EMAIL}?subject=${encodeURIComponent("Запит комерційної пропозиції")}` +
  `&body=${encodeURIComponent(RFQ_FIELDS.join("\n\n") + "\n")}`;

export interface Direction {
  id: string;
  name: string;
  examples?: string;
}

// 14 groups from company.business_lines; examples are the client's own words from the brackets.
export const DIRECTIONS: Direction[] = [
  { id: "reanimation", name: "Реанімаційне обладнання", examples: "ШВЛ, дефібрилятори, монітори пацієнта, інфузійне обладнання, відеоларингоскопи" },
  { id: "ventilation", name: "Апарати ШВЛ", examples: "апарати наркозно-дихальні, компресори медичні" },
  { id: "cardio", name: "Кардіологія", examples: "електрокардіографи, монітори пацієнта, пульсоксиметри, фетальні монітори, холтери" },
  { id: "oxygen", name: "Кисневе обладнання", examples: "кисневі концентратори, прилади високопотокової терапії" },
  { id: "neonatal", name: "Неонатологія", examples: "інкубатори, ШВЛ для новонароджених, фототерапія, обігрівачі" },
  { id: "surgery", name: "Хірургія", examples: "операційні столи, світильники, мікроскопи, відсмоктувачі" },
  { id: "endoscopy", name: "Ендоскопічне обладнання" },
  { id: "spirometry", name: "Аналізатори газів видоху, спірометрія" },
  { id: "furniture", name: "Медичні меблі", examples: "лікарняні, акушерські, дитячі ліжка, шафи, каталки, кушетки, тумби" },
  { id: "steel", name: "Меблі з нержавіючої сталі", examples: "ліжка, візки, столи інструментальні, перев'язочні, маніпуляційні, шафи, тумби" },
  { id: "physio", name: "Фізіотерапія", examples: "електро-, ультразвукова, лазерна, ударно-хвильова, ТЕКАР-терапія" },
  { id: "lab", name: "Лабораторне обладнання", examples: "стерилізація та очищення" },
  { id: "rehab", name: "Обладнання для іммобілізації", examples: "реабілітація, ортопедія і травматологія" },
  { id: "other", name: "Офтальмологія", examples: "стоматологічне обладнання, голкоспалювачі, термометри" },
];

export const NAV = [
  { href: "#directions", label: "Напрямки" },
  { href: "#clinics", label: "Закладам" },
  { href: "#home-care", label: "Для дому" },
  { href: "#service", label: "Сервіс" },
  { href: "#delivery", label: "Доставка" },
  { href: "#contacts", label: "Контакти" },
];
