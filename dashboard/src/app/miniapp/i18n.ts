export const t = {
  // Navigation
  nav_home: 'Главная',
  nav_search: 'Поиск',
  nav_cart: 'Корзина',
  nav_orders: 'Заказы',
  nav_profile: 'Профиль',

  // Home
  store_subtitle: 'Строительные и электроинструменты',
  search_placeholder: 'Поиск товаров, брендов...',
  hero_label: 'Магазин UGO',
  hero_title: 'Качественный\nинструмент',
  hero_sub: 'Топ бренды · Быстрая доставка',
  products_count: (n: number) => `${n} товаров`,
  no_products: 'Товары не найдены',

  // Categories
  cat_all: 'Все',

  // Product card
  add_to_cart: 'В корзину',

  // Product detail
  in_stock: '✓ В наличии',
  add_to_cart_price: (p: string) => `В корзину — ${p}`,
  in_cart: (n: number) => `${n} в корзине`,

  // Cart
  cart_title: 'Корзина',
  cart_empty_title: 'Корзина пуста',
  cart_empty_sub: 'Добавьте товары из каталога',
  cart_items: (n: number) => `${n} товаров`,
  place_order: 'Оформить заказ',
  placing_order: 'Отправка...',
  order_sent_title: 'Заказ отправлен!',
  order_sent_sub: 'Наш менеджер свяжется с вами для подтверждения.',
  continue_shopping: 'Продолжить покупки',
  start_bot_first: 'Сначала запустите бот для оформления заказа',
  remove: 'Удалить',

  // Orders
  orders_title: 'Мои заказы',
  no_account_title: 'Нет аккаунта',
  no_account_sub: 'Запустите бот командой /start для регистрации.',
  no_orders_title: 'Заказов пока нет',
  no_orders_sub: 'История ваших заказов появится здесь.',

  // Order statuses
  status_pending: 'Ожидает',
  status_awaiting_confirmation: 'На подтверждении',
  status_confirmed: 'Подтверждён ✅',
  status_cancelled: 'Отменён',
  status_processing: 'В обработке',
  status_delivered: 'Доставлен 🎉',

  // Profile
  total_orders: 'Всего заказов',
  items_in_cart: 'В корзине',
  phone_label: 'Телефон',
  my_orders: 'Мои заказы',
  orders_history: 'История заказов',
  reg_needed_title: 'Требуется регистрация',
  reg_needed_sub: 'Запустите бот командой /start и поделитесь номером телефона.',

  // Register
  reg_welcome: (name: string) => `Добро пожаловать, ${name}!`,
  reg_subtitle: 'Быстрая настройка для начала заказов',
  reg_phone_title: 'Поделитесь номером телефона',
  reg_phone_sub: 'Чтобы мы могли связаться с вами по заказу',
  reg_share_phone: '📱 Поделиться номером',
  reg_skip: 'Пропустить',
  reg_company_title: 'Название компании или аккаунта',
  reg_company_sub: 'Чтобы мы знали, чей это заказ',
  reg_company_placeholder: 'Например: ООО Стройтех',
  reg_finish: '✅ Завершить регистрацию',
  reg_saving: 'Сохранение...',

  // Search
  search_results: (n: number, q: string) => `${n} результатов для «${q}»`,
  search_no_results: (q: string) => `Ничего не найдено для «${q}»`,
  search_start: 'Начните вводить для поиска',

  // Custom order
  custom_order_tab: 'Заказ',
  custom_order_title: 'Заказать по описанию',
  custom_order_sub: 'Опишите что нужно или загрузите фото прайса',
  custom_type_placeholder: 'Например: болты М8 100шт, шуруповёрт DeWalt...',
  custom_upload_photo: '📷 Загрузить фото',
  custom_analyze: '🤖 Определить товары',
  custom_analyzing: 'Анализирую...',
  custom_add_all: 'Добавить всё в корзину',
  custom_not_found: 'Не удалось определить товары. Попробуйте другое описание.',
}
