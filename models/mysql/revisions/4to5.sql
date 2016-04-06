-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `entree_r5`.`Restaurants`
CHARACTER SET = latin1 , COLLATE = latin1_swedish_ci ,
CHANGE COLUMN `mode` `mode` ENUM('REGULAR','GOD') CHARACTER SET 'utf8' NOT NULL ;

ALTER TABLE `entree_r5`.`Sizes`
CHARACTER SET = latin1 , COLLATE = latin1_swedish_ci ;

ALTER TABLE `entree_r5`.`Users`
CHARACTER SET = latin1 , COLLATE = latin1_swedish_ci ;

ALTER TABLE `entree_r5`.`Categories`
ADD CONSTRAINT `Categories_ibfk_1`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r5`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`ChatStates`
ADD CONSTRAINT `ChatStates_ibfk_1`
  FOREIGN KEY (`UserId`)
  REFERENCES `entree_r5`.`Users` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `ChatStates_ibfk_2`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r5`.`Restaurants` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `ChatStates_ibfk_3`
  FOREIGN KEY (`MenuItemId`)
  REFERENCES `entree_r5`.`MenuItems` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `ChatStates_ibfk_4`
  FOREIGN KEY (`OrderId`)
  REFERENCES `entree_r5`.`Orders` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `ChatStates_ibfk_5`
  FOREIGN KEY (`ItemModId`)
  REFERENCES `entree_r5`.`ItemMods` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`CommandMaps`
ADD CONSTRAINT `CommandMaps_ibfk_1`
  FOREIGN KEY (`ChatStateId`)
  REFERENCES `entree_r5`.`ChatStates` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`ItemMods`
ADD CONSTRAINT `ItemMods_ibfk_1`
  FOREIGN KEY (`MenuItemId`)
  REFERENCES `entree_r5`.`MenuItems` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`Locations`
ADD CONSTRAINT `Locations_ibfk_1`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r5`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`MenuItems`
ADD CONSTRAINT `MenuItems_ibfk_1`
  FOREIGN KEY (`CategoryId`)
  REFERENCES `entree_r5`.`Categories` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`Mods`
ADD CONSTRAINT `Mods_ibfk_1`
  FOREIGN KEY (`ItemModId`)
  REFERENCES `entree_r5`.`ItemMods` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`OrderItemAssociations`
ADD CONSTRAINT `OrderItemAssociations_ibfk_1`
  FOREIGN KEY (`OrderId`)
  REFERENCES `entree_r5`.`Orders` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `OrderItemAssociations_ibfk_2`
  FOREIGN KEY (`ItemId`)
  REFERENCES `entree_r5`.`Items` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`OrderItems`
ADD CONSTRAINT `OrderItems_ibfk_1`
  FOREIGN KEY (`ChatStateId`)
  REFERENCES `entree_r5`.`ChatStates` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`Orders`
ADD CONSTRAINT `Orders_ibfk_1`
  FOREIGN KEY (`UserId`)
  REFERENCES `entree_r5`.`Users` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `Orders_ibfk_2`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r5`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`RestaurantHours`
ADD CONSTRAINT `RestaurantHours_ibfk_1`
  FOREIGN KEY (`RestaurantId`)
  REFERENCES `entree_r5`.`Restaurants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `entree_r5`.`Sizes`
ADD CONSTRAINT `Sizes_ibfk_1`
  FOREIGN KEY (`MenuItemId`)
  REFERENCES `entree_r5`.`MenuItems` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;