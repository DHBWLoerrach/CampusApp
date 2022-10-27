import { DOMParser } from '@xmldom/xmldom';

export default function fetchCanteenData(canteenXMLData) {
  let dayPlans = [];
  let parser = new DOMParser();
  let doc = parser.parseFromString(canteenXMLData, 'application/xml');
  let loerrach = doc.getElementById('677');
  if (loerrach === null || loerrach === undefined) return dayPlans;
  let plansByDay = loerrach.getElementsByTagName('tagesplan');

  for (let i = 0; i < plansByDay.length; i++) {
    let menusOfTheDay = [];
    let menus = plansByDay.item(i).getElementsByTagName('menue');

    for (let k = 0; k < menus.length; k++) {
      let menuElement = menus.item(k);
      let addition =
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

      let addition2 =
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

      let vegetarianAttribute = menuElement.attributes.getNamedItem(
        'zusatz'
      );
      let vegetarian =
        vegetarianAttribute != null &&
        (vegetarianAttribute.nodeValue === 'vegetarisch' ||
          vegetarianAttribute.nodeValue === 'vegan');
      let prices = [];
      let pushPrices = function (customerType, variableName) {
        let priceElement = menuElement
          .getElementsByTagName(customerType)
          .item(0).childNodes;
        prices.push({
          price: priceElement.item(0).nodeValue,
          type: variableName,
        });
      };
      pushPrices('studierende', 'student');
      pushPrices('angestellte', 'employee');
      pushPrices('gaeste', 'guest');

      // sometimes menus don't have a name, use category in that case (e.g. 'Buffet')
      let menuName = menuElement.attributes.getNamedItem('art')
        .nodeValue;
      let nameElement = menuElement
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
        prices: prices,
      });
    }

    dayPlans.push({
      date: plansByDay.item(i).attributes.getNamedItem('datum')
        .nodeValue,
      menus: menusOfTheDay,
    });
  }
  return dayPlans;
}
