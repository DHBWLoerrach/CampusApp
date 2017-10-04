// @flow
import { DOMParser } from 'xmldom';

export default function fetchCanteenData(canteenXMLData) {
  var dayPlans = [];
  var parser = new DOMParser();
  var doc = parser.parseFromString(canteenXMLData, 'application/xml');
  var plansByDay = doc.getElementsByTagName('tagesplan');

  for (var i = 0; i < plansByDay.length; i++) {
    var menusOfTheDay = [];
    var menus = plansByDay.item(i).getElementsByTagName('menue');

    for (var k = 0; k < menus.length; k++) {
      var menuElement = menus.item(k);
      var addition =
        menuElement
          .getElementsByTagName('allergikerhinweise')
          .item(0)
          .childNodes.item(0) !== null
          ? menuElement
              .getElementsByTagName('allergikerhinweise')
              .item(0)
              .childNodes.item(0).nodeValue
          : '';
      if (addition) {
        // remove 'Ei: '' etc from string
        addition = addition.replace(/,\w+: /g, ',');
        addition = addition.replace(/.*: /, '');
        addition = addition.split(',');
      }

      var addition2 =
        menuElement
          .getElementsByTagName('kennzeichnungen')
          .item(0)
          .childNodes.item(0) !== null
          ? menuElement
              .getElementsByTagName('kennzeichnungen')
              .item(0)
              .childNodes.item(0).nodeValue
          : '';
      if (addition2) {
        // remove '1: '' etc from string
        addition2 = addition2.replace(/,\w+: /g, ',');
        addition2 = addition2.replace(/.*: /, '');
        // remove 'mit ' from string
        addition2 = addition2.replace(/mit /g, '');
        addition2 = addition2.split(',');
      }

      addition = addition.concat(addition2);

      var vegetarianAttribute = menuElement.attributes.getNamedItem('zusatz');
      var vegetarian =
        vegetarianAttribute != null &&
        (vegetarianAttribute.nodeValue === 'vegetarisch' ||
          vegetarianAttribute.nodeValue === 'vegan');
      var prices = [];
      var pushPrices = function(customerType, variableName) {
        var priceElement = menuElement
          .getElementsByTagName(customerType)
          .item(0).childNodes;
        prices.push({
          price: priceElement.item(0).nodeValue,
          type: variableName
        });
      };
      pushPrices('studierende', 'student');
      pushPrices('angestellte', 'employee');
      pushPrices('gaeste', 'guest');

      // sometimes menus don't have a name, use category in that case (e.g. 'Buffet')
      var menuName = menuElement.attributes.getNamedItem('art').nodeValue;
      var nameElement = menuElement
        .getElementsByTagName('name')
        .item(0)
        .childNodes.item(0);
      if (nameElement) {
        menuName = nameElement.nodeValue;
      }
      menusOfTheDay.push({
        menu: menuElement.attributes.getNamedItem('art').nodeValue,
        addition: addition,
        vegetarian: vegetarian,
        name: menuName,
        prices: prices
      });
    }

    dayPlans.push({
      date: plansByDay.item(i).attributes.getNamedItem('datum').nodeValue,
      menus: menusOfTheDay
    });
  }
  return dayPlans;
}
