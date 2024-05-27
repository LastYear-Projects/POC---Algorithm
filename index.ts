//TODO - Refactor types, and move to other files.

enum ValueType {
  POINTS = "points",
  CASHBACK = "cashback", //User cannot choose cashback as an option, Its an added bonus to
  //the respective credit card.
  DISCOUNT = "discount",
}

enum DiscountType {
  PERCENTAGE = "percentage",
  NUMBER = "number",
}

type CreditCard = {
  id: number;
  name: string;
};

type Business = {
  id: number;
  name: string;
};

type Benefit = {
  businessId?: number;
  creditCardId: number;
  valueType: ValueType;
  discountType: DiscountType;
  value: number;
};

type UserPreferences = {
  creditCardsIds: number[];
  valueType: ValueType;
};

//----------------------------------DUMMY DATA------------------------------------
const creditCards: CreditCard[] = [
  {
    id: 0,
    name: "visa",
  },
  {
    id: 1,
    name: "isracard",
  },
];

const businesses: Business[] = [
  {
    id: 0,
    name: "burekas-ha-agala",
  },
  {
    id: 1,
    name: "golda",
  },
];

const benefits: Benefit[] = [
  {
    businessId: 0,
    creditCardId: 0,
    discountType: DiscountType.PERCENTAGE,
    valueType: ValueType.DISCOUNT,
    value: 30,
  },
  {
    businessId: 1,
    creditCardId: 1,
    discountType: DiscountType.NUMBER,
    valueType: ValueType.CASHBACK,
    value: 15,
  },
  {
    creditCardId: 0,
    discountType: DiscountType.NUMBER,
    valueType: ValueType.POINTS,
    value: 50,
  },
];

const userPreferences: UserPreferences[] = [
  {
    creditCardsIds: [0, 1],
    valueType: ValueType.DISCOUNT,
  },
  {
    creditCardsIds: [1, 0],
    valueType: ValueType.DISCOUNT,
  },
  {
    creditCardsIds: [1, 0],
    valueType: ValueType.POINTS,
  },
];
//----------------------------------END OF DUMMY DATA------------------------------------

//Example for point to money conversion.
const pointsToMoneyMap = {
  flycard: 5,
  foxhome: 2,
  burekasHaAgala: 7,
};

//Work with tuples or with this Type.
type GradedBenefit = {
  benefit: Benefit;
  grade: number;
};

const grading = (
  benefit: Benefit,
  userPreferences: UserPreferences,
  transactionPrice: number
) => {
  let grade: number = 0;
  if (benefit.valueType === ValueType.CASHBACK) return { benefit, grade: 0 };
  switch (userPreferences.valueType) {
    case ValueType.DISCOUNT:
      //Percentage turns into number and graded appropriately.
      if (benefit.discountType === DiscountType.PERCENTAGE) {
        grade = transactionPrice - transactionPrice * (benefit.value / 100);
      } else {
        grade = transactionPrice - benefit.value;
      }
      break;
    case ValueType.POINTS:
      //What to do with points, they are not directly effecting all credit cards.(Will explain).
      break;
  }
  return { benefit, grade };
};

const gradingAlgorithm = (
  benefits: Benefit[],
  userPreferences: UserPreferences,
  transactionPrice: number
) => {
  const gradedBenefits: GradedBenefit[] = [];

  benefits.forEach((benefit) => {
    gradedBenefits.push(grading(benefit, userPreferences, transactionPrice));
  });

  return gradedBenefits.sort((a, b) => a.grade - b.grade);
};
