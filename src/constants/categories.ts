// Default categories with subcategories for initial seeding

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Food & Dining',
    icon: 'utensils',
    color: '#ef4444',
    subcategories: ['Groceries', 'Restaurants', 'Coffee', 'Delivery', 'Snacks'],
  },
  {
    name: 'Transport',
    icon: 'car',
    color: '#f97316',
    subcategories: ['Fuel', 'Public Transit', 'Grab/Taxi', 'Parking', 'Maintenance', 'Tolls'],
  },
  {
    name: 'Bills & Utilities',
    icon: 'receipt',
    color: '#eab308',
    subcategories: ['Electricity', 'Water', 'Internet', 'Phone', 'Rent', 'Insurance'],
  },
  {
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#22c55e',
    subcategories: ['Clothing', 'Electronics', 'Home & Garden', 'Personal Care', 'Gifts'],
  },
  {
    name: 'Entertainment',
    icon: 'gamepad-2',
    color: '#14b8a6',
    subcategories: ['Movies', 'Games', 'Subscriptions', 'Hobbies', 'Events'],
  },
  {
    name: 'Health & Fitness',
    icon: 'heart-pulse',
    color: '#06b6d4',
    subcategories: ['Medicine', 'Doctor', 'Gym', 'Sports', 'Wellness'],
  },
  {
    name: 'Education',
    icon: 'graduation-cap',
    color: '#3b82f6',
    subcategories: ['Tuition', 'Books', 'Courses', 'School Supplies', 'Training'],
  },
  {
    name: 'Personal',
    icon: 'user',
    color: '#8b5cf6',
    subcategories: ['Haircut', 'Laundry', 'Donations', 'Memberships'],
  },
  {
    name: 'Travel',
    icon: 'plane',
    color: '#ec4899',
    subcategories: ['Flights', 'Hotels', 'Activities', 'Souvenirs'],
  },
  {
    name: 'Other Expenses',
    icon: 'more-horizontal',
    color: '#6b7280',
    subcategories: ['Miscellaneous', 'Fees', 'Taxes', 'Fines'],
  },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Salary',
    icon: 'banknote',
    color: '#22c55e',
    subcategories: ['Regular Pay', 'Bonus', 'Overtime', '13th Month'],
  },
  {
    name: 'Business',
    icon: 'briefcase',
    color: '#3b82f6',
    subcategories: ['Sales', 'Services', 'Commission', 'Profit Share'],
  },
  {
    name: 'Investments',
    icon: 'trending-up',
    color: '#8b5cf6',
    subcategories: ['Dividends', 'Interest', 'Capital Gains', 'Rental Income'],
  },
  {
    name: 'Freelance',
    icon: 'laptop',
    color: '#f97316',
    subcategories: ['Projects', 'Consulting', 'Part-time'],
  },
  {
    name: 'Other Income',
    icon: 'plus-circle',
    color: '#6b7280',
    subcategories: ['Gifts', 'Refunds', 'Reimbursements', 'Rebates'],
  },
];

export const ALL_DEFAULT_CATEGORIES = {
  expense: DEFAULT_EXPENSE_CATEGORIES,
  income: DEFAULT_INCOME_CATEGORIES,
};
