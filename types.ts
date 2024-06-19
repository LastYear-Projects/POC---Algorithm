export enum ValueType {
    PERCENTAGE = "percentage",
    NUMBER = "number",
  }
  
  export enum DiscountType {
    POINTS = "points",
    CASHBACK = "cashback", // User cannot choose cashback as an option, it's an added bonus to the respective credit card.
    DISCOUNT = "discount",
  }
  
  export type CreditCard = {
    id: number;
    name: string;
  };
  
  export type Business = {
    id: number;
    name: string;
  };
  
  export type Benefit = {
    businessId?: number;
    creditCardId: number;
    valueType: ValueType;
    discountType: DiscountType;
    value: number;
  };
  
  export type UserPreferences = {
    creditCardsIds: number[];
    discountType: DiscountType;
  };
  
  export type GradedBenefit = {
    benefit: Benefit;
    grade: number;
  };
  
  
  