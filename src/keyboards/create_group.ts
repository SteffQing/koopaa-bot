const ContributionIntervalMarkup = {
  keyboard: [[{ text: "Daily" }, { text: "Weekly" }, { text: "Monthly" }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

const PayoutIntervalMarkup = {
  keyboard: [[{ text: "Weekly" }, { text: "Bi-Weekly" }, { text: "Monthly" }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

const TagMarkup = {
  keyboard: [
    [{ text: "Real Estate" }, { text: "Birthday" }, { text: "Finance" }],
    [{ text: "Lifestyle" }, { text: "Education" }, { text: "Travel" }],
  ],
  resize_keyboard: true,
  one_time_keyboard: true,
};

const CoverPhotoMarkup = {
  inline_keyboard: [
    [
      { text: "1️⃣", callback_data: "choose_cover:1" },
      { text: "2️⃣", callback_data: "choose_cover:2" },
    ],
    [
      { text: "3️⃣", callback_data: "choose_cover:3" },
      { text: "4️⃣", callback_data: "choose_cover:4" },
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: true,
};

const ConfirmGroupCreate = [
  [
    { text: "✅ Confirm", callback_data: "create_ajo:confirm" },
    { text: "❌ Cancel", callback_data: "create_ajo:cancel" },
  ],
];

export { ContributionIntervalMarkup, PayoutIntervalMarkup, TagMarkup, CoverPhotoMarkup, ConfirmGroupCreate };
