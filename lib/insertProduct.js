const { Client } = require("pg");

// اطلاعات اتصال به دیتابیس خود را وارد کنید
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "my_next_auth_db",
  password: "123",
  port: 5432, // پورت پیش‌فرض PostgreSQL
});

async function createProducts(products) {
  try {
    await client.connect(); // اتصال به دیتابیس

    for (const product of products) {
      const {
        title,
        description,
        price,
        real_price,
        discount,
        image_urls,
        category_id,
        brand_id,
        special_offer,
      } = product;

      const query = `
        INSERT INTO products (title, description, price, real_price, discount, image_urls, category_id, brand_id, special_offer)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      const values = [
        title,
        description,
        price,
        real_price,
        discount,
        image_urls,
        category_id,
        brand_id,
        special_offer,
      ];

      await client.query(query, values); // اجرای پرس و جوی درج

    }

   
  } catch (error) {
    console.error("Error creating products:", error);
  } finally {
    await client.end(); // بستن اتصال به دیتابیس
  }
}

// آرایه محصولات
const products = [
  {
    title: "کیف مجلسی زنانه مدل ELENA",
    description:
      "کیف دستی زنانه با جنس چرم مصنوعی و طراحی مینیمال، مناسب برای استفاده روزانه و مهمانی‌ها.",
    price: 320000,
    real_price: 400000,
    discount: 80000,
    image_urls: [
      "http://localhost:5000/uploads/16.jpg",
      "http://localhost:5000/uploads/17.jpg",
    ],
    category_id: 1,
    brand_id: 5,
    special_offer: true,
  },
  {
    title: "عینک آفتابی ورساچه مدل Classic",
    description: "عینک آفتابی زنانه برند ورساچه با فریم طلایی و لنز پلاریزه.",
    price: 2100000,
    real_price: 2500000,
    discount: 400000,
    image_urls: [
      "http://localhost:5000/uploads/14.jpg",
      "http://localhost:5000/uploads/15.jpg",
    ],
    category_id: 2,
    brand_id: 6,
    special_offer: false,
  },
  {
    title: "کفش رسمی زنانه چرم طبیعی مدل Classic",
    description:
      "کفش پاشنه‌دار زنانه از چرم طبیعی با کفی نرم و راحت، مناسب برای محیط‌های اداری.",
    price: 1100000,
    real_price: 1350000,
    discount: 250000,
    image_urls: [
      "http://localhost:5000/uploads/12.jpg",
      "http://localhost:5000/uploads/13.jpg",
    ],
    category_id: 3,
    brand_id: 11,
    special_offer: false,
  },
  {
    title: "دستبند زنانه استیل مدل Infinity",
    description:
      "دستبند ظریف زنانه از جنس استیل طلایی با طراحی سمبلیک بی‌نهایت، مقاوم در برابر تغییر رنگ.",
    price: 380000,
    real_price: 450000,
    discount: 70000,
    image_urls: [
      "http://localhost:5000/uploads/10.jpg",
      "http://localhost:5000/uploads/11.jpg",
    ],
    category_id: 4,
    brand_id: 12,
    special_offer: true,
  },
  {
    title: "کیف کمری اسپرت مدل Runner",
    description:
      "کیف کمری ضدآب، سبک و مناسب برای کوهنوردی، دوچرخه‌سواری و پیاده‌روی.",
    price: 190000,
    real_price: 230000,
    discount: 40000,
    image_urls: [
      "http://localhost:5000/uploads/8.jpg",
      "http://localhost:5000/uploads/9.jpg",
    ],
    category_id: 1,
    brand_id: 13,
    special_offer: false,
  },
  {
    title: "عینک آفتابی پلیس مدل Sporty",
    description: "عینک آفتابی مردانه برند پلیس با طراحی اسپرت و لنز ضد خش.",
    price: 1750000,
    real_price: 2000000,
    discount: 250000,
    image_urls: [
      "http://localhost:5000/uploads/6.jpg",
      "http://localhost:5000/uploads/7.jpg",
    ],
    category_id: 2,
    brand_id: 14,
    special_offer: true,
  },
  {
    title: "کفش کوهنوردی مردانه مدل PRO-HIKER",
    description:
      "کفش مخصوص کوهنوردی با کفی مقاوم و رویه ضدآب، مناسب برای سفرهای طولانی.",
    price: 2100000,
    real_price: 2500000,
    discount: 400000,
    image_urls: [
      "http://localhost:5000/uploads/5.jpg",
      "http://localhost:5000/uploads/4.jpg",
    ],
    category_id: 3,
    brand_id: 15,
    special_offer: false,
  },
  {
    title: "دستبند چرم مردانه مدل Spartan",
    description:
      "دستبند اسپرت مردانه با طراحی یونانی و قفل مغناطیسی، مناسب برای استایل‌های کژوال.",
    price: 310000,
    real_price: 380000,
    discount: 70000,
    image_urls: [
      "http://localhost:5000/uploads/2.png",
      "http://localhost:5000/uploads/1.jpg",
    ],
    category_id: 4,
    brand_id: 16,
    special_offer: true,
  },
];

createProducts(products);
