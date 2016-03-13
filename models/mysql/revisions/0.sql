-- MySQL dump 10.13  Distrib 5.7.10, for osx10.11 (x86_64)
--
-- Host: localhost    Database: entree_r0
-- ------------------------------------------------------
-- Server version	5.7.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `RestaurantId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `RestaurantId` (`RestaurantId`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`RestaurantId`) REFERENCES `Restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ChatStates`
--

DROP TABLE IF EXISTS `ChatStates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ChatStates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state` varchar(16) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `RestaurantId` int(11) DEFAULT NULL,
  `MenuItemId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  KEY `RestaurantId` (`RestaurantId`),
  KEY `MenuItemId` (`MenuItemId`),
  CONSTRAINT `chatstates_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chatstates_ibfk_2` FOREIGN KEY (`RestaurantId`) REFERENCES `Restaurants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chatstates_ibfk_3` FOREIGN KEY (`MenuItemId`) REFERENCES `MenuItems` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CommandMaps`
--

DROP TABLE IF EXISTS `CommandMaps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CommandMaps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` int(11) NOT NULL,
  `value` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ChatStateId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ChatStateId` (`ChatStateId`),
  CONSTRAINT `commandmaps_ibfk_1` FOREIGN KEY (`ChatStateId`) REFERENCES `ChatStates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ItemMods`
--

DROP TABLE IF EXISTS `ItemMods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ItemMods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL,
  `addPrice` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `MenuItemId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `MenuItemId` (`MenuItemId`),
  CONSTRAINT `itemmods_ibfk_1` FOREIGN KEY (`MenuItemId`) REFERENCES `MenuItems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Items`
--

DROP TABLE IF EXISTS `Items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `description` varchar(64) DEFAULT NULL,
  `price` float NOT NULL,
  `canSell` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Locations`
--

DROP TABLE IF EXISTS `Locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(64) NOT NULL,
  `city` varchar(32) NOT NULL,
  `state` varchar(2) NOT NULL,
  `zipcode` varchar(5) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `RestaurantId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `RestaurantId` (`RestaurantId`),
  CONSTRAINT `locations_ibfk_1` FOREIGN KEY (`RestaurantId`) REFERENCES `Restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MenuItems`
--

DROP TABLE IF EXISTS `MenuItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MenuItems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL,
  `description` varchar(64) NOT NULL,
  `basePrice` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `CategoryId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CategoryId` (`CategoryId`),
  CONSTRAINT `menuitems_ibfk_1` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderItemAssociations`
--

DROP TABLE IF EXISTS `OrderItemAssociations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderItemAssociations` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `OrderId` int(11) NOT NULL,
  `ItemId` int(11) NOT NULL,
  PRIMARY KEY (`OrderId`,`ItemId`),
  KEY `ItemId` (`ItemId`),
  CONSTRAINT `orderitemassociations_ibfk_1` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderitemassociations_ibfk_2` FOREIGN KEY (`ItemId`) REFERENCES `Items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderItems`
--

DROP TABLE IF EXISTS `OrderItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderItems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `price` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ChatStateId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ChatStateId` (`ChatStateId`),
  CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`ChatStateId`) REFERENCES `ChatStates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` enum('PENDING_PAYMENT','FAILED_PAYMENT','RECEIVED_PAYMENT','ACCEPTED','DECLINED','COMPLETED') NOT NULL,
  `prepTime` int(11) DEFAULT NULL,
  `message` varchar(64) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `RestaurantId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  KEY `RestaurantId` (`RestaurantId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`RestaurantId`) REFERENCES `Restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `RestaurantHours`
--

DROP TABLE IF EXISTS `RestaurantHours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RestaurantHours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dayOfTheWeek` varchar(10) NOT NULL,
  `openTime` time NOT NULL,
  `closeTime` time NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `RestaurantId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `RestaurantId` (`RestaurantId`),
  CONSTRAINT `restauranthours_ibfk_1` FOREIGN KEY (`RestaurantId`) REFERENCES `Restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Restaurants`
--

DROP TABLE IF EXISTS `Restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Restaurants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `password` varchar(64) NOT NULL,
  `phoneNumber` varchar(10) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT '1',
  `deleted` tinyint(1) DEFAULT '0',
  `mode` enum('REGULAR','GOD') NOT NULL,
  `merchantId` varchar(32) DEFAULT NULL,
  `merchantApproved` tinyint(1) DEFAULT NULL,
  `percentageFee` decimal(5,2) DEFAULT NULL,
  `transactionFee` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `merchantId` (`merchantId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Sizes`
--

DROP TABLE IF EXISTS `Sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Sizes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` enum('Small','Medium','Large') NOT NULL,
  `addPrice` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `MenuItemId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `MenuItemId` (`MenuItemId`),
  CONSTRAINT `sizes_ibfk_1` FOREIGN KEY (`MenuItemId`) REFERENCES `MenuItems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phoneNumber` varchar(10) NOT NULL,
  `firstName` varchar(64) DEFAULT NULL,
  `lastName` varchar(64) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `customerId` varchar(36) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phoneNumber` (`phoneNumber`),
  UNIQUE KEY `customerId` (`customerId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-03-16  0:05:14
