-- phpMyAdmin SQL Dump
-- Database: bread
-- Description: Bread bakery product catalog

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Database: `bread`
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `bread` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bread`;

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name_ja` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Insert categories
-- --------------------------------------------------------
INSERT INTO `categories` (`name_ja`, `name_en`, `slug`) VALUES
('スイートブレッド', 'Sweet Breads', 'sweet-breads'),
('エピ', 'Épis', 'epis'),
('ベーグル', 'Bagels', 'bagels'),
('アルチザンブレッド', 'Artisan Breads', 'artisan'),
('ロールパン', 'Rolls', 'rolls');

-- --------------------------------------------------------
-- Table: products
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `name_ja` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `description_ja` text,
  `description_en` text,
  `price` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `contains_dairy` tinyint(1) NOT NULL DEFAULT 0,
  `contains_eggs` tinyint(1) NOT NULL DEFAULT 0,
  `contains_nuts` tinyint(1) NOT NULL DEFAULT 0,
  `contains_wheat` tinyint(1) NOT NULL DEFAULT 1,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_category_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Insert products
-- --------------------------------------------------------
INSERT INTO `products` (`category_id`, `name_ja`, `name_en`, `description_ja`, `description_en`, `price`, `contains_dairy`, `contains_eggs`, `contains_nuts`, `contains_wheat`, `is_available`) VALUES
-- Sweet Breads (category_id = 1)
(1, 'メロンパン', 'Melon Pan', 'サクサクのクッキー生地をのせた甘いパン', 'Sweet bun with a crispy cookie crust', 280, 1, 1, 0, 1, 1),
(1, 'クッキーパン', 'Cookie Bread', 'クッキー風味のやさしい甘さのパン', 'Soft bread with a gentle cookie flavor', 250, 1, 1, 0, 1, 1),
(1, 'あんぱん', 'Anpan', '北海道産小豆を使用した自家製あんこ入り', 'Filled with homemade red bean paste using Hokkaido azuki', 260, 0, 1, 0, 1, 1),
(1, 'シナモンロール', 'Cinnamon Roll', 'シナモンシュガーをたっぷり巻き込んだ渦巻きパン', 'Swirl bread generously rolled with cinnamon sugar', 320, 1, 1, 0, 1, 1),
(1, 'アップルリング', 'Apple Ring', 'りんごのコンポートを包んだリング型の甘いパン', 'Ring-shaped sweet bread filled with apple compote', 350, 1, 1, 0, 1, 1),
(1, '黒胡麻パン', 'Black Sesame Bread', '香ばしい黒胡麻をたっぷり練り込んだパン', 'Bread generously kneaded with fragrant black sesame', 270, 0, 0, 0, 1, 1),
(1, '抹茶ロール', 'Matcha Roll', '宇治抹茶を使用した風味豊かなロールパン', 'Flavorful roll made with Uji matcha', 300, 1, 1, 0, 1, 1),
(1, 'チョコチップパン', 'Chocolate Chip Bread', 'ベルギーチョコチップがたっぷり入った甘いパン', 'Sweet bread loaded with Belgian chocolate chips', 290, 1, 1, 0, 1, 1),
(1, 'キャラメルツイスト', 'Caramel Twist', 'キャラメルソースをツイストした甘いデニッシュ', 'Sweet danish twisted with caramel sauce', 330, 1, 1, 0, 1, 1),
(1, '生クリーム食パン', 'Fresh Cream Shokupan', '生クリームをたっぷり使ったしっとり食パン', 'Moist milk bread made with generous fresh cream', 450, 1, 1, 0, 1, 1),
(1, 'ヴィエノワ', 'Viennois', 'フランス風のやわらかい甘いパン', 'Soft French-style sweet bread', 280, 1, 1, 0, 1, 1),

-- Épis (category_id = 2)
(2, 'ベーコンエピ', 'Bacon Épi', 'カリカリベーコンを包んだ麦の穂型パン', 'Wheat stalk shaped bread wrapped with crispy bacon', 380, 0, 0, 0, 1, 1),
(2, 'オリーブエピ', 'Olive Épi', 'オリーブをたっぷり入れた麦の穂型パン', 'Wheat stalk shaped bread filled with olives', 360, 0, 0, 0, 1, 1),
(2, 'チーズエピ', 'Cheese Épi', 'チェダーチーズを包んだ麦の穂型パン', 'Wheat stalk shaped bread with cheddar cheese', 370, 1, 0, 0, 1, 1),

-- Bagels (category_id = 3)
(3, 'かぼちゃベーグル', 'Pumpkin Bagel', '北海道産かぼちゃを練り込んだもちもちベーグル', 'Chewy bagel made with Hokkaido pumpkin', 320, 0, 0, 0, 1, 1),
(3, 'ココナッツミルクベーグル', 'Coconut Milk Bagel', 'ココナッツミルクの香り豊かなベーグル', 'Fragrant bagel made with coconut milk', 310, 0, 0, 0, 1, 1),
(3, 'チーズベーグル', 'Cheese Bagel', 'クリームチーズを練り込んだ濃厚ベーグル', 'Rich bagel kneaded with cream cheese', 340, 1, 0, 0, 1, 1),

-- Artisan Breads (category_id = 4)
(4, 'フロマージュクッペ', 'Fromage Coupe', 'チーズをのせて焼き上げたクッペ', 'Coupe bread baked with cheese on top', 350, 1, 0, 0, 1, 1),
(4, 'フォカッチャ', 'Focaccia', 'オリーブオイルとローズマリーの香るイタリアンパン', 'Italian bread fragrant with olive oil and rosemary', 380, 0, 0, 0, 1, 1),
(4, 'リュスティック', 'Rustic Bread', '外はパリッと中はもちもちの素朴なパン', 'Rustic bread with crispy crust and chewy inside', 300, 0, 0, 0, 1, 1),
(4, 'バケット', 'Baguette', '伝統的なフランスパン、外はカリカリ中はふわふわ', 'Traditional French bread, crispy outside and fluffy inside', 320, 0, 0, 0, 1, 1),

-- Rolls (category_id = 5)
(5, 'バターロール', 'Butter Roll', 'バターの香り豊かなふんわりロールパン', 'Fluffy roll bread rich with butter aroma', 180, 1, 1, 0, 1, 1);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
