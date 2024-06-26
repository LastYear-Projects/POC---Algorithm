import mongoose from "mongoose";

export enum DiscountType {
  POINTS = "points",
  CASHBACK = "cashback", //User cannot choose cashback as an option, Its an added bonus to
  //the respective credit card.
  DISCOUNT = "discount",
}

export type UserPreferences = {
  profitType: ProfitType;
  cardsPreference: mongoose.Schema.Types.ObjectId[];
};

export interface ICreditCard {
  cardName: String;
  pointToMoney: number;
}

export interface IBenefit {
  businessId?: mongoose.Schema.Types.ObjectId;
  creditCardId: mongoose.Schema.Types.ObjectId;
  discountType: DiscountType;
  valueType: ValueType;
  value: number;
  pointsValue?: number; // describes the mapping between points --> shekels. for example - 0.01 means that 1 points worth 0.01 shekels. (exists only in points benefits)
  maxProfit?: number; //for a percentage benefit - describe the maximum profit a user can achieve. (may exists only in percentage)
  minPurchaseAmount?: number; // for a number benefit - describe the minimum purchase amount should be to activate the benefit. (exists only in number benefits)
}

export enum ProfitType {
  POINTS = "points",
  LOWEST_PRICE = "lowestPrice",
  NOMINAL_PROFIT = "nominalProfit",
}

export interface PopulatedBenefit extends IBenefit {
  creditCard: ICreditCard;
}

export enum ValueType {
  PERCENTAGE = "percentage",
  NUMBER = "number",
}

export type EvaluatedCreditCard = {
  creditCardId: mongoose.Schema.Types.ObjectId;
  grade: number;
  profit: number;
};

const card1Id =
  new mongoose.Types.ObjectId() as any as mongoose.Schema.Types.ObjectId;
const card2Id =
  new mongoose.Types.ObjectId() as any as mongoose.Schema.Types.ObjectId;
const card3Id =
  new mongoose.Types.ObjectId() as any as mongoose.Schema.Types.ObjectId;

const userPreferences: UserPreferences = {
  profitType: ProfitType.LOWEST_PRICE,
  cardsPreference: [card1Id, card2Id, card3Id],
};

const creditCard1: ICreditCard = {
  cardName: "Card One",
  pointToMoney: 0.01,
};

const creditCard2: ICreditCard = {
  cardName: "Card Two",
  pointToMoney: 0.02,
};

const creditCard3: ICreditCard = {
  cardName: "Card Three",
  pointToMoney: 0.015,
};

const populatedBenefits: PopulatedBenefit[] = [
  {
    creditCard: creditCard1,
    creditCardId: card1Id,
    discountType: DiscountType.DISCOUNT,
    valueType: ValueType.PERCENTAGE,
    value: 10,
  },
  {
    creditCard: creditCard2,
    creditCardId: card2Id,
    discountType: DiscountType.POINTS,
    valueType: ValueType.NUMBER,
    value: 100,
  },
  {
    creditCard: creditCard3,
    creditCardId: card3Id,
    discountType: DiscountType.CASHBACK,
    valueType: ValueType.NUMBER,
    value: 50,
  },
];

// Corrected Functions

const calculateGrade = (
  populatedBenefit: PopulatedBenefit,
  transactionPrice: number
): number => {
  let grade = 0;

  switch (populatedBenefit.discountType) {
    case DiscountType.DISCOUNT:
      if (populatedBenefit.valueType === ValueType.PERCENTAGE) {
        grade = transactionPrice * (populatedBenefit.value / 100);
      } else {
        grade = populatedBenefit.value;
      }
      break;
    case DiscountType.POINTS:
      const pointToMoneyValue = populatedBenefit.creditCard.pointToMoney;
      grade = populatedBenefit.value * pointToMoneyValue;
      break;
  }
  return grade;
};

const evaluatedCreditCardsWithCashBack = (
  userPreferences: UserPreferences,
  populatedBenefits: PopulatedBenefit[]
): EvaluatedCreditCard[] => {
  return userPreferences.cardsPreference.map((creditCard) => {
    const cashBackBenefit = populatedBenefits.find(
      (benefit) =>
        benefit.creditCardId === creditCard &&
        benefit.discountType === DiscountType.CASHBACK &&
        !benefit.businessId
    );
    const cashbackValue =
      (cashBackBenefit?.creditCard.pointToMoney ?? 0) *
      (cashBackBenefit?.value ?? 0);
    return {
      creditCardId: creditCard,
      grade: cashbackValue,
      profit: cashbackValue,
    };
  });
};

const gradePopulatedBenefits = (
  populatedBenefits: PopulatedBenefit[],
  transactionAmount: number
) => {
  return populatedBenefits.map((populatedBenefit) => ({
    populatedBenefit,
    grade: calculateGrade(populatedBenefit, transactionAmount),
  }));
};

const findBestBenefit = (
  gradedPopulatedBenefits: {
    populatedBenefit: PopulatedBenefit;
    grade: number;
  }[],
  creditCardId: mongoose.Schema.Types.ObjectId
) => {
  return gradedPopulatedBenefits
    .filter(
      (populatedMapObject) =>
        populatedMapObject.populatedBenefit.creditCardId === creditCardId
    )
    .sort((a, b) => b.grade - a.grade)[0];
};

const getRecommendations = (
  populatedBenefits: PopulatedBenefit[],
  userPreferences: UserPreferences,
  transactionAmount: number
): EvaluatedCreditCard[] => {
  const evaluatedCreditCards = evaluatedCreditCardsWithCashBack(
    userPreferences,
    populatedBenefits
  );

  const gradedPopulatedBenefits = gradePopulatedBenefits(
    populatedBenefits,
    transactionAmount
  );

  evaluatedCreditCards.forEach((evaluatedCreditCard) => {
    const bestBenefitMapObject = findBestBenefit(
      gradedPopulatedBenefits,
      evaluatedCreditCard.creditCardId
    );
    if (bestBenefitMapObject) {
      evaluatedCreditCard.grade += bestBenefitMapObject.grade;
      evaluatedCreditCard.profit += bestBenefitMapObject.grade;
    }
  });

  return evaluatedCreditCards.sort((a, b) => b.grade - a.grade);
};

// Test Function
const testGetRecommendations = () => {
  const transactionAmount = 1000;
  const recommendations = getRecommendations(
    populatedBenefits,
    userPreferences,
    transactionAmount
  );

  console.log("Recommendations:", recommendations);
};

testGetRecommendations();
