-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER SCHEMA `entree_r8`  DEFAULT CHARACTER SET utf8  DEFAULT COLLATE utf8_general_ci ;

ALTER TABLE `entree_r8`.`Categories` 
DROP FOREIGN KEY `Categories_ibfk_1`;

ALTER TABLE `entree_r8`.`ChatStates` 
DROP FOREIGN KEY `ChatStates_ibfk_5`,
DROP FOREIGN KEY `ChatStates_ibfk_4`,
DROP FOREIGN KEY `ChatStates_ibfk_3`,
DROP FOREIGN KEY `ChatStates_ibfk_2`,
DROP FOREIGN KEY `ChatStates_ibfk_1`;

ALTER TABLE `entree_r8`.`CommandMaps` 
DROP FOREIGN KEY `CommandMaps_ibfk_1`;

ALTER TABLE `entree_r8`.`ItemMods` 
DROP FOREIGN KEY `ItemMods_ibfk_1`;

ALTER TABLE `entree_r8`.`Locations` 
DROP FOREIGN KEY `Locations_ibfk_1`;

ALTER TABLE `entree_r8`.`MenuItems` 
DROP FOREIGN KEY `MenuItems_ibfk_1`;

ALTER TABLE `entree_r8`.`Mods` 
DROP FOREIGN KEY `Mods_ibfk_1`;

ALTER TABLE `entree_r8`.`OrderItemAssociations` 
DROP FOREIGN KEY `OrderItemAssociations_ibfk_2`,
DROP FOREIGN KEY `OrderItemAssociations_ibfk_1`;

ALTER TABLE `entree_r8`.`OrderItems` 
DROP FOREIGN KEY `OrderItems_ibfk_1`;

ALTER TABLE `entree_r8`.`Orders` 
DROP FOREIGN KEY `Orders_ibfk_2`,
DROP FOREIGN KEY `Orders_ibfk_1`;

ALTER TABLE `entree_r8`.`RestaurantHours` 
DROP FOREIGN KEY `RestaurantHours_ibfk_1`;

ALTER TABLE `entree_r8`.`Sizes` 
DROP FOREIGN KEY `Sizes_ibfk_1`;

ALTER TABLE `entree_r8`.`Categories` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`ChatStates` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`CommandMaps` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`ItemMods` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`Items` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`Locations` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`MenuItems` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`Mods` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`OrderItemAssociations` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ,
CHANGE COLUMN `OrderId` `OrderId` INT(11) NOT NULL ,
CHANGE COLUMN `ItemId` `ItemId` INT(11) NOT NULL ;

ALTER TABLE `entree_r8`.`OrderItems` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`Orders` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`RestaurantHours` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`Restaurants` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ,
ADD COLUMN `profileImage` VARCHAR(512) NULL DEFAULT NULL AFTER `phoneNumber`;

ALTER TABLE `entree_r8`.`Sizes` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`Users` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

ALTER TABLE `entree_r8`.`Categories` 
ADD CONSTRAINT `categories_ibfk_1`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r8`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`ChatStates` 
ADD CONSTRAINT `chatstates_ibfk_1`
  FOREIGN KEY (`UserId`)
  REFERENCES `entree_r8`.`Users` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `chatstates_ibfk_2`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r8`.`Restaurants` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `chatstates_ibfk_3`
  FOREIGN KEY (`MenuItemId`)
  REFERENCES `entree_r8`.`MenuItems` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `chatstates_ibfk_4`
  FOREIGN KEY (`OrderId`)
  REFERENCES `entree_r8`.`Orders` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `chatstates_ibfk_5`
  FOREIGN KEY (`ItemModId`)
  REFERENCES `entree_r8`.`ItemMods` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`CommandMaps` 
ADD CONSTRAINT `commandmaps_ibfk_1`
  FOREIGN KEY (`ChatStateId`)
  REFERENCES `entree_r8`.`ChatStates` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`ItemMods` 
ADD CONSTRAINT `itemmods_ibfk_1`
  FOREIGN KEY (`MenuItemId`)
  REFERENCES `entree_r8`.`MenuItems` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`Locations` 
ADD CONSTRAINT `locations_ibfk_1`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r8`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`MenuItems` 
ADD CONSTRAINT `menuitems_ibfk_1`
  FOREIGN KEY (`CategoryId`)
  REFERENCES `entree_r8`.`Categories` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`Mods` 
ADD CONSTRAINT `mods_ibfk_1`
  FOREIGN KEY (`ItemModId`)
  REFERENCES `entree_r8`.`ItemMods` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`OrderItemAssociations` 
ADD CONSTRAINT `orderitemassociations_ibfk_1`
  FOREIGN KEY (`OrderId`)
  REFERENCES `entree_r8`.`Orders` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `orderitemassociations_ibfk_2`
  FOREIGN KEY (`ItemId`)
  REFERENCES `entree_r8`.`Items` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`OrderItems` 
ADD CONSTRAINT `orderitems_ibfk_1`
  FOREIGN KEY (`ChatStateId`)
  REFERENCES `entree_r8`.`ChatStates` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`Orders` 
ADD CONSTRAINT `orders_ibfk_1`
  FOREIGN KEY (`UserId`)
  REFERENCES `entree_r8`.`Users` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `orders_ibfk_2`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r8`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`RestaurantHours` 
ADD CONSTRAINT `restauranthours_ibfk_1`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r8`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r8`.`Sizes` 
ADD CONSTRAINT `sizes_ibfk_1`
  FOREIGN KEY (`MenuItemId`)
  REFERENCES `entree_r8`.`MenuItems` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
