# Поля, которые нужно добавить в Bonavista CMS для полного соответствия странице Barcelona Boat Rental

Ниже приведён **полный практический список полей**, которых сейчас не хватает Bonavista CMS, если целью является приблизить карточку яхты к структуре страницы Barcelona Boat Rental. Я разделил их на логические группы, чтобы по ним было удобно проектировать базу данных, форму редактора и отображение на публичной карточке.

| Группа | Поле | Тип данных | Пример | Зачем нужно |
|---|---|---|---|---|
| Локация | `marinaName` | string | `Marina Vela, Barcelona` | Показывает точку посадки и базовую географию яхты |
| Локация | `city` | string | `Barcelona` | Нужно для витрины, фильтров и SEO |
| Локация | `region` | string | `Catalonia` | Полезно для каталога и маршрутов |
| Локация | `country` | string | `Spain` | Для географической структуры каталога |
| Локация | `berthLocationText` | text | `Port Vell, Barcelona` | Отдельный человекочитаемый блок места посадки |
| Локация | `latitude` | decimal | `41.3851` | Для карты и геопривязки |
| Локация | `longitude` | decimal | `2.1734` | Для карты и геопривязки |
| Коммерческая модель | `rentalType` | enum/string | `with crew` | Определяет формат аренды |
| Коммерческая модель | `captainIncluded` | boolean | `true` | Явно показывает, входит ли капитан |
| Коммерческая модель | `crewIncluded` | boolean | `true` | Явно показывает, входит ли экипаж |
| Коммерческая модель | `minimumOrderHours` | number | `4` | Один из ключевых критериев бронирования |
| Коммерческая модель | `minimumOrderUnit` | enum | `hours` | Чтобы не кодировать единицу измерения в текст |
| Коммерческая модель | `instantBookEnabled` | boolean | `false` | На будущее для различия запроса и мгновенного бронирования |
| Технические характеристики | `lengthValue` | decimal | `25` | Отдельное структурированное поле длины |
| Технические характеристики | `lengthUnit` | enum | `m` | Нормализует отображение длины |
| Технические характеристики | `beamValue` | decimal | `12.5` | Ширина судна |
| Технические характеристики | `beamUnit` | enum | `m` | Единица измерения beam |
| Технические характеристики | `draftValue` | decimal | `1.4` | Осадка судна |
| Технические характеристики | `draftUnit` | enum | `m` | Единица измерения draft |
| Технические характеристики | `yearBuilt` | number | `2008` | Год постройки |
| Технические характеристики | `modelName` | string | `Ocean Voyager 78` | Модель яхты |
| Технические характеристики | `boatCategory` | string | `Catamaran Rental` | Основная категория яхты |
| Технические характеристики | `boatSubcategories` | array<string> | `['Big Boats Rental', 'Catamaran Rental']` | Для мультикатегорийности как на странице BBR |
| Технические характеристики | `toiletsCount` | number | `2` | Важный потребительский параметр |
| Технические характеристики | `engineSpec` | string | `228 hp` | Данные по двигателю |
| Технические характеристики | `cruisingSpeedValue` | decimal | `8` | Крейсерская скорость |
| Технические характеристики | `cruisingSpeedUnit` | enum | `knots` | Единица скорости |
| Технические характеристики | `internalReferenceId` | string/number | `9479` | Внутренний ID карточки/объекта |
| Вместимость | `maxGuests` | number | `120` | Если нужно хранить отдельно от общего guestCapacity |
| Вместимость | `recommendedGuests` | number | `80` | Нужен для ценовых порогов и мягких ограничений |
| Цены | `pricingMode` | enum | `tiered` | Позволяет различать фиксированную и табличную цену |
| Цены | `currency` | enum/string | `EUR` | Для правильного форматирования |
| Цены | `basePriceLabel` | string | `from €375/hour` | Для краткой маркетинговой цены |
| Цены | `vatIncluded` | boolean | `false` | Чёткая налоговая политика |
| Цены | `vatRate` | decimal | `21` | Нужен для расчётов и отображения |
| Цены | `pricingNotes` | text | `21% VAT not included` | Пояснения к ценообразованию |
| Цены | `seasonalPricing` | relation/table | см. ниже | Для таблицы цен по сезонам и группам |
| Цены | `extrasPricing` | relation/table | см. ниже | Для open bar, waiter fee, coordination fee |
| Услуги | `includedServices` | array<string> | `['Captain', 'Sailor', 'Fuel']` | Чтобы не прятать это в тексте |
| Услуги | `complimentaryItems` | array<string> | `['Vegetable chips', 'Rosemary almonds']` | Отдельно для hospitality content |
| Услуги | `extraServiceNotes` | text | `Alcohol served after swim stop` | Нестандартные условия услуги |
| Услуги | `serviceStaffRatioText` | text | `1 waiter per 25 guests` | Важное условие обслуживания |
| Правила | `smokingAllowed` | boolean | `false` | Для блока rules |
| Правила | `petsAllowed` | boolean | `false` | Для блока rules |
| Правила | `partyAllowed` | boolean | `true` | Для блока rules |
| Правила | `childrenAllowed` | boolean | `true` | Для блока rules |
| Правила | `rulesNotes` | text | `Alcohol only after swimming stop` | Для расширенных условий |
| Оборудование | `equipmentItems` | array<string> | `['GPS', 'Fridge', 'VHF']` | Лучше хранить отдельно от amenities |
| Контент | `heroBadge` | string | `WITH CAPTAIN (INCLUDED)` | Для заметного бейджа в заголовке |
| Контент | `shortLocationLabel` | string | `Marina Vela, Barcelona` | Для краткой строки под названием |
| Контент | `ctaPrimaryLabel` | string | `Request to Book` | Гибкость CTA на странице |
| Контент | `ctaSecondaryLabel` | string | `Contact us` | Вторичный сценарий обращения |
| Контент | `bookingHelpText` | text | `Our managers are always ready to help` | Текст около формы заявки |
| Медиа и социальное доказательство | `reviewsEnabled` | boolean | `true` | Для управления блоком отзывов |
| Медиа и социальное доказательство | `reviewCount` | number | `0` | Количество отзывов |
| Медиа и социальное доказательство | `verifiedReviewsOnly` | boolean | `true` | Для бейджа verified reviews |
| Связанные сущности | `similarBoatsEnabled` | boolean | `true` | Управление блоком похожих судов |
| Связанные сущности | `similarBoatIds` | array<number> | `[12, 18, 44]` | Ручная подборка похожих яхт |

## Отдельные связанные таблицы, которые желательно добавить

Для полного соответствия одной таблицы `yachts` будет недостаточно. Часть данных лучше вынести в отдельные связанные сущности.

| Таблица | Поля | Назначение |
|---|---|---|
| `yacht_pricing_tiers` | `seasonLabel`, `minHours`, `maxGuests`, `minGuests`, `price`, `currency`, `sortOrder` | Табличные цены по сезону, длительности и диапазону гостей |
| `yacht_extra_fees` | `feeType`, `label`, `pricingModel`, `amount`, `currency`, `unitLabel`, `notes`, `sortOrder` | Доплаты вроде open bar, waiter fee, coordination fee |
| `yacht_included_services` | `label`, `sortOrder` | Что включено в стоимость |
| `yacht_equipment` | `label`, `sortOrder` | Список оборудования на борту |
| `yacht_rules` | `ruleKey`, `ruleValue`, `notes` | Формализованные правила пользования |
| `yacht_locations` | `marinaName`, `city`, `country`, `latitude`, `longitude`, `mapLabel` | Отдельная модель локации |

## Минимальный набор, который нужен в первую очередь

Если внедрять не всё сразу, то для наиболее заметного приближения к Barcelona Boat Rental я рекомендую сначала добавить следующие поля и сущности.

| Приоритет | Что добавить первым |
|---|---|
| Высокий | `marinaName`, `minimumOrderHours`, `rentalType`, `captainIncluded`, `crewIncluded` |
| Высокий | `lengthValue`, `beamValue`, `draftValue`, `yearBuilt`, `modelName`, `toiletsCount`, `engineSpec`, `cruisingSpeedValue` |
| Высокий | `vatIncluded`, `vatRate`, `includedServices`, `equipmentItems`, `rules` |
| Высокий | Таблицы `yacht_pricing_tiers` и `yacht_extra_fees` |
| Средний | `latitude`, `longitude`, `reviewCount`, `similarBoatIds` |
| Средний | CTA-поля и маркетинговые подписи карточки |

## Итог

Если говорить строго, то для **полного соответствия** Bonavista CMS должна перейти от текущей базовой модели яхты к более широкой модели, где отдельно существуют:

1. **структурированные технические характеристики**;
2. **условия аренды**;
3. **табличные цены и доплаты**;
4. **включённые услуги и оборудование**;
5. **формализованные правила**;
6. **локация и карта**;
7. **смежные коммерческие блоки** вроде похожих яхт и отзывов.

Именно этот набор полей закроет основной разрыв между текущей CMS и страницей Barcelona Boat Rental.

## References

[1]: https://barcelonaboatrental.com/barcelona/ocean-voyager-78-catamaran/ "Catamaran Ocean Voyager 78 rental in Barcelona"
