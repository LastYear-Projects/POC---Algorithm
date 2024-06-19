import { ValueType, DiscountType, CreditCard, Business, Benefit, UserPreferences, GradedBenefit } from './types';

// Dummy data
const creditCards: CreditCard[] = [
  { id: 0, name: "visa" },
  { id: 1, name: "isracard" },
];

const businesses: Business[] = [
  { id: 0, name: "burekas-ha-agala" },
  { id: 1, name: "golda" },
];

const benefits: Benefit[] = [
  { businessId: 0, creditCardId: 0, valueType: ValueType.PERCENTAGE, discountType: DiscountType.DISCOUNT, value: 30 },
  { businessId: 1, creditCardId: 1, valueType: ValueType.NUMBER, discountType: DiscountType.CASHBACK, value: 15 },
  { creditCardId: 0, valueType: ValueType.NUMBER, discountType: DiscountType.POINTS, value: 50 },
  { creditCardId: 0, valueType: ValueType.NUMBER, discountType: DiscountType.CASHBACK, value: 10 }, // Cashback for credit card 0
];

const userPreferences: UserPreferences[] = [
  { creditCardsIds: [0, 1], discountType: DiscountType.DISCOUNT },
  { creditCardsIds: [1, 0], discountType: DiscountType.DISCOUNT },
  { creditCardsIds: [1, 0], discountType: DiscountType.POINTS },
  { creditCardsIds: [0], discountType: DiscountType.POINTS },
  { creditCardsIds: [1], discountType: DiscountType.CASHBACK },
];

// Mapping points to money conversion based on credit card names
const pointsToMoneyMap: { [key: string]: number } = {
  visa: 5, // for creditCardId 0
  isracard: 2, // for creditCardId 1
  burekasHaAgala: 7, // Assuming this was for a business ID, but not used in this context
};

/**
 * Converts a benefit to a graded benefit based on user preferences and transaction price.
 * Adds a bonus for cashback benefits tied to a credit card.
 * @param {Benefit} benefit - The benefit to grade.
 * @param {UserPreferences} userPreferences - The user's preferences.
 * @param {number} transactionPrice - The price of the transaction.
 * @param {Benefit[]} allBenefits - The list of all benefits to check for credit card cashback.
 * @returns {number} - The grade of the benefit.
 */
const grading = (benefit: Benefit, userPreferences: UserPreferences, transactionPrice: number, allBenefits: Benefit[]): number => {
  let grade = 0;

  // Find if the credit card itself has a cashback benefit
  const creditCardCashbackBenefit = allBenefits.find(b => b.creditCardId === benefit.creditCardId && b.discountType === DiscountType.CASHBACK && !b.businessId);
  const cashbackBonus = creditCardCashbackBenefit ? creditCardCashbackBenefit.value : 0;

  switch (userPreferences.discountType) {
    case DiscountType.DISCOUNT:
      if (benefit.valueType === ValueType.PERCENTAGE) {
        grade = transactionPrice - (transactionPrice * (benefit.value / 100)) + cashbackBonus;
      } else {
        grade = transactionPrice - benefit.value + cashbackBonus;
      }
      break;
    case DiscountType.POINTS:
      // Convert points to money equivalent for grading
      const creditCardName = creditCards.find(card => card.id === benefit.creditCardId)?.name || '';
      const pointsValue = pointsToMoneyMap[creditCardName] || 0;
      grade = transactionPrice - (benefit.value * pointsValue) + cashbackBonus;
      break;
  }
  return grade;
};

/**
 * Sorts and grades benefits based on user preferences and transaction price.
 * @param {Benefit[]} benefits - The list of benefits to grade.
 * @param {UserPreferences} userPreferences - The user's preferences.
 * @param {number} transactionPrice - The price of the transaction.
 * @returns {GradedBenefit[]} - The list of graded benefits sorted in descending order of their grade.
 */
const gradingAlgorithm = (benefits: Benefit[], userPreferences: UserPreferences, transactionPrice: number): GradedBenefit[] => {
  const gradedBenefits = benefits
    .filter(benefit => userPreferences.creditCardsIds.includes(benefit.creditCardId))
    .map(benefit => ({
      benefit,
      grade: grading(benefit, userPreferences, transactionPrice, benefits)
    }));

  return gradedBenefits.sort((a, b) => b.grade - a.grade);
};

// Example scenarios to test the algorithm
const scenarios = [
  { transactionAmount: 100, userPreference: userPreferences[0] },
  { transactionAmount: 200, userPreference: userPreferences[1] },
  { transactionAmount: 150, userPreference: userPreferences[2] },
  { transactionAmount: 250, userPreference: userPreferences[3] },
  { transactionAmount: 300, userPreference: userPreferences[4] },
];

// Run and log each scenario
scenarios.forEach((scenario, index) => {
  const sortedBenefits = gradingAlgorithm(benefits, scenario.userPreference, scenario.transactionAmount);
  console.log(`Scenario ${index + 1}:`);
  console.log(sortedBenefits);
});
