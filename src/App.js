import React, { useState, useEffect } from 'react';
import { User, Users, Package, ShoppingCart, List, Settings, LogOut, Eye, EyeOff, Calendar, DollarSign, Database } from 'lucide-react';

// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-anon-key',
  // Replace with your actual Supabase project URL and anon key
};

// Mock Supabase client (replace with real supabase client)
const supabase = {
  from: (table) => ({
    insert: async (data) => {
      console.log(`Mock: Inserting into ${table}:`, data);
      return { data, error: null };
    },
    select: async (columns = '*') => {
      console.log(`Mock: Selecting ${columns} from ${table}`);
      return { data: [], error: null };
    },
    update: async (data) => {
      console.log(`Mock: Updating ${table}:`, data);
      return { data, error: null };
    },
    eq: function(column, value) {
      console.log(`Mock: Where ${column} = ${value}`);
      return this;
    }
  }),
  auth: {
    signUp: async (credentials) => {
      console.log('Mock: Sign up:', credentials);
      return { data: { user: null }, error: null };
    },
    signIn: async (credentials) => {
      console.log('Mock: Sign in:', credentials);
      return { data: { user: null }, error: null };
    }
  }
};

const weeklyMealPlan = {
  Monday: {
    breakfast: ["Uji (porridge)", "Boiled/Fried egg", "Fruit (banana/mango/orange)"],
    dinner: ["Ugali (cooked)", "Sukuma wiki/spinach", "Fish (tilapia/omena)", "Fruit (pawpaw/pineapple/avocado)"]
  },
  Tuesday: {
    breakfast: ["Tea/Cocoa", "Bread", "Spreads (peanut butter/honey)", "Fruit (pawpaw/pineapple/avocado)"],
    dinner: ["Rice (cooked)", "Beans/Ndengu (cooked)", "Cabbage/cucumber salad", "Fruit (banana/mango/orange)"]
  },
  Wednesday: {
    breakfast: ["Mandazi/Pancake", "Tea/Cocoa", "Fruit (banana/mango/orange)"],
    dinner: ["Ugali (cooked)", "Sukuma wiki/spinach", "Chicken (meat, cooked)", "Fruit (banana/mango/orange)"]
  },
  Thursday: {
    breakfast: ["Sweet potatoes (boiled)", "Tea/Cocoa", "Fruit (banana/mango/orange)"],
    dinner: ["Githeri", "Fruit (pawpaw/pineapple/avocado)", "Fruit (banana/mango/orange)"]
  },
  Friday: {
    breakfast: ["Mandazi/Pancake", "Tea/Cocoa", "Fruit (pawpaw/pineapple/avocado)"],
    dinner: ["Chapati", "Beef/Goat (cooked)", "Cabbage/cucumber salad", "Fruit (pawpaw/pineapple/avocado)"]
  },
  Saturday: {
    breakfast: ["Tea/Cocoa", "Chapati", "Boiled/Fried egg", "Fruit (banana/mango/orange)"],
    dinner: ["Pilau", "Cabbage/cucumber salad", "Fruit (pawpaw/pineapple/avocado)"]
  },
  Sunday: {
    breakfast: ["Bread", "Sausages/Smokies", "Fruit (pawpaw/pineapple/avocado)"],
    dinner: ["Potatoes (boiled/mashed)", "Beef/Goat (cooked)", "Cabbage/cucumber salad", "Fruit (banana/mango/orange)"]
  }
};

const foodPortions = {
  "Uji (porridge)": { unit: "ml", portions: { infants: 125, toddlers: 250, children: 300, teens: 400, adults: 400 }},
  "Ugali (cooked)": { unit: "g", portions: { infants: 50, toddlers: 80, children: 120, teens: 180, adults: 200 }},
  "Rice (cooked)": { unit: "g", portions: { infants: 60, toddlers: 120, children: 150, teens: 200, adults: 200 }},
  "Chapati": { unit: "g", portions: { infants: 50, toddlers: 100, children: 250, teens: 300, adults: 300 }},
  "Bread": { unit: "g", portions: { infants: 50, toddlers: 100, children: 250, teens: 300, adults: 300 }},
  "Mandazi/Pancake": { unit: "g", portions: { infants: 50, toddlers: 100, children: 250, teens: 300, adults: 300 }},
  "Boiled/Fried egg": { unit: "piece", portions: { infants: 1, toddlers: 1, children: 1, teens: 2, adults: 1 }},
  "Milk": { unit: "ml", portions: { infants: 250, toddlers: 250, children: 250, teens: 250, adults: 250 }},
  "Beans/Ndengu (cooked)": { unit: "g", portions: { infants: 45, toddlers: 125, children: 200, teens: 200, adults: 200 }},
  "Githeri": { unit: "g", portions: { infants: 70, toddlers: 250, children: 300, teens: 350, adults: 350 }},
  "Beef/Goat (cooked)": { unit: "g", portions: { infants: 30, toddlers: 50, children: 60, teens: 90, adults: 100 }},
  "Chicken (meat, cooked)": { unit: "g", portions: { infants: 30, toddlers: 120, children: 120, teens: 240, adults: 240 }},
  "Fish (tilapia/omena)": { unit: "g", portions: { infants: 50, toddlers: 60, children: 150, teens: 250, adults: 250 }},
  "Sausages/Smokies": { unit: "g", portions: { infants: 45, toddlers: 45, children: 90, teens: 90, adults: 90 }},
  "Potatoes (boiled/mashed)": { unit: "g", portions: { infants: 60, toddlers: 120, children: 150, teens: 200, adults: 200 }},
  "Sweet potatoes (boiled)": { unit: "g", portions: { infants: 60, toddlers: 120, children: 150, teens: 200, adults: 200 }},
  "Sukuma wiki/spinach": { unit: "g", portions: { infants: 20, toddlers: 80, children: 100, teens: 120, adults: 120 }},
  "Cabbage/cucumber salad": { unit: "g", portions: { infants: 20, toddlers: 80, children: 100, teens: 120, adults: 120 }},
  "Fruit (banana/mango/orange)": { unit: "piece", portions: { infants: 1, toddlers: 1, children: 1, teens: 1, adults: 1 }},
  "Fruit (pawpaw/pineapple/avocado)": { unit: "piece", portions: { infants: 0.25, toddlers: 0.25, children: 0.25, teens: 0.25, adults: 0.25 }},
  "Spreads (peanut butter/honey)": { unit: "g", portions: { infants: 10, toddlers: 15, children: 20, teens: 25, adults: 25 }},
  "Pilau": { unit: "g", portions: { infants: 60, toddlers: 120, children: 150, teens: 200, adults: 200 }},
  "Cooking oil": { unit: "ml", portions: { infants: 3, toddlers: 10, children: 10, teens: 15, adults: 15 }},
  "Tea/Cocoa": { unit: "ml", portions: { infants: 0, toddlers: 100, children: 150, teens: 250, adults: 500 }}
};

const ingredientBreakdown = {
  "Uji (porridge)": [
    { name: "Porridge flour", ratio: 0.06, unit: "kg" },
    { name: "Sugar", ratio: 0.008, unit: "kg" }
  ],
  "Ugali (cooked)": [
    { name: "Maize flour", ratio: 0.001, unit: "kg" }
  ],
  "Rice (cooked)": [
    { name: "Rice", ratio: 0.001, unit: "kg" }
  ],
  "Pilau": [
    { name: "Rice", ratio: 0.001, unit: "kg" },
    { name: "Cooking oil", ratio: 0.1, unit: "ml" },
    { name: "Onions", ratio: 0.005, unit: "piece" },
    { name: "Garlic", ratio: 0.002, unit: "kg" },
    { name: "Pilau masala", ratio: 0.01, unit: "kg" }
  ],
  "Chapati": [
    { name: "Wheat flour", ratio: 0.001, unit: "kg" },
    { name: "Cooking oil", ratio: 0.06, unit: "ml" },
    { name: "Salt", ratio: 0.001, unit: "kg" }
  ],
  "Bread": [
    { name: "Bread loaves", ratio: 0.00167, unit: "loaf" }
  ],
  "Mandazi/Pancake": [
    { name: "Wheat flour", ratio: 0.001, unit: "kg" },
    { name: "Sugar", ratio: 0.05, unit: "kg" },
    { name: "Cooking oil", ratio: 0.1, unit: "ml" }
  ],
  "Boiled/Fried egg": [
    { name: "Raw eggs", ratio: 1, unit: "piece" },
    { name: "Salt", ratio: 0.00025, unit: "kg" }
  ],
  "Milk": [
    { name: "Milk packets", ratio: 0.002, unit: "packet" }
  ],
  "Beans/Ndengu (cooked)": [
    { name: "Beans/Ndengu", ratio: 0.001, unit: "kg" },
    { name: "Salt", ratio: 0.0025, unit: "kg" },
    { name: "Tomatoes", ratio: 0.005, unit: "piece" },
    { name: "Onions", ratio: 0.0025, unit: "piece" },
    { name: "Cooking oil", ratio: 0.15, unit: "ml" }
  ],
  "Githeri": [
    { name: "Maize flour", ratio: 0.0005, unit: "kg" },
    { name: "Beans/Ndengu", ratio: 0.0005, unit: "kg" },
    { name: "Salt", ratio: 0.002, unit: "kg" },
    { name: "Cooking oil", ratio: 0.1, unit: "ml" }
  ],
  "Tea/Cocoa": [
    { name: "Sugar", ratio: 0.12, unit: "kg" },
    { name: "Tea leaves", ratio: 0.006, unit: "kg" },
    { name: "Milk", ratio: 0.25, unit: "ml" }
  ],
  "Spreads (peanut butter/honey)": [
    { name: "Peanut butter/honey", ratio: 1, unit: "g" }
  ]
};

const ageGroups = [
  { id: 'infants', name: '6-23 months' },
  { id: 'toddlers', name: '24-59 months' },
  { id: 'children', name: '5-9 years' },
  { id: 'teens', name: '10-19 years' },
  { id: 'adults', name: '20-59 years' }
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isReporting, setIsReporting] = useState(false);
  const [dbStatus, setDbStatus] = useState('disconnected');
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', phone: '', building: '', houseNumber: '', password: '',
    familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
  });
  
  const [users, setUsers] = useState([]);
  const [userIngredients, setUserIngredients] = useState({});
  const [orders, setOrders] = useState([]);
  const [ingredientPrices, setIngredientPrices] = useState({
    "Porridge flour": 100,
    "Sugar": 150,
    "Maize flour": 80,
    "Rice": 180,
    "Wheat flour": 120,
    "Cooking oil": 200,
    "Salt": 50,
    "Bread loaves": 100,
    "Raw eggs": 20,
    "Milk packets": 60,
    "Beans/Ndengu": 150,
    "Tomatoes": 200,
    "Onions": 250,
    "Garlic": 300,
    "Pilau masala": 500,
    "Tea leaves": 300,
    "Milk": 60,
    "Peanut butter/honey": 400,
    "Beef/Goat (cooked)": 600,
    "Chicken (meat, cooked)": 1000,
    "Fish (tilapia/omena)": 300,
    "Sausages/Smokies": 500,
    "Potatoes (boiled/mashed)": 100,
    "Sweet potatoes (boiled)": 100,
    "Sukuma wiki/spinach": 700,
    "Cabbage/cucumber salad": 600,
    "Fruit (banana/mango/orange)": 700,
    "Fruit (pawpaw/pineapple/avocado)": 800,
    "Spreads (peanut butter/honey)": 400,
    "Pilau": 200
  });

  // Database functions
  const database = {
    testConnection: async () => {
      try {
        setDbStatus('connecting');
        const { data, error } = await supabase.from('users').select('count');
        if (error) throw error;
        setDbStatus('connected');
        return true;
      } catch (error) {
        console.error('Database connection failed:', error);
        setDbStatus('error');
        return false;
      }
    },
    users: {
      create: async (userData) => {
        try {
          setIsReporting(true);
          const { data, error } = await supabase.from('users').insert([{
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            building: userData.building,
            house_number: userData.houseNumber,
            family_composition: userData.familyComposition,
            total_members: Object.values(userData.familyComposition).reduce((sum, count) => sum + count, 0),
            role: userData.role || 'user',
            status: 'active',
            created_at: new Date().toISOString()
          }]);
          
          if (error) throw error;
          console.log('User saved to Supabase:', data);
          return { success: true, data };
        } catch (error) {
          console.error('Failed to save user:', error);
          return { success: false, error };
        } finally {
          setIsReporting(false);
        }
      },
      getAll: async () => {
        try {
          const { data, error } = await supabase.from('users').select('*');
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          console.error('Failed to fetch users:', error);
          return { success: false, error };
        }
      }
    },
    orders: {
      create: async (orderData) => {
        try {
          setIsReporting(true);
          const { data, error } = await supabase.from('orders').insert([{
            user_id: orderData.userId,
            user_name: orderData.userName,
            items: orderData.items,
            total_cost: orderData.totalCost,
            items_count: orderData.items.length,
            status: orderData.status,
            order_date: orderData.date,
            created_at: new Date().toISOString()
          }]);
          
          if (error) throw error;
          console.log('Order saved to Supabase:', data);
          return { success: true, data };
        } catch (error) {
          console.error('Failed to save order:', error);
          return { success: false, error };
        } finally {
          setIsReporting(false);
        }
      },
      updateStatus: async (orderId, status) => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', orderId);
          
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          console.error('Failed to update order:', error);
          return { success: false, error };
        }
      },
      getAll: async () => {
        try {
          const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          return { success: false, error };
        }
      }
    },
    ingredients: {
      logUsage: async (userId, userName, ingredients) => {
        try {
          setIsReporting(true);
          const ingredientRecords = Object.entries(ingredients).map(([name, data]) => ({
            user_id: userId,
            user_name: userName,
            ingredient_name: name,
            weekly_need: data.weeklyNeed,
            monthly_need: data.monthlyNeed,
            current_stock: data.currentStock,
            unit: data.unit,
            cost_per_unit: data.cost,
            recorded_at: new Date().toISOString()
          }));

          const { data, error } = await supabase.from('ingredient_usage').insert(ingredientRecords);
          
          if (error) throw error;
          console.log('Ingredient usage saved to Supabase:', data);
          return { success: true, data };
        } catch (error) {
          console.error('Failed to save ingredient usage:', error);
          return { success: false, error };
        } finally {
          setIsReporting(false);
        }
      }
    },
    prices: {
      logUpdate: async (ingredient, oldPrice, newPrice) => {
        try {
          const { data, error } = await supabase.from('price_updates').insert([{
            ingredient_name: ingredient,
            old_price: oldPrice,
            new_price: newPrice,
            change_amount: newPrice - oldPrice,
            change_percent: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2),
            updated_at: new Date().toISOString()
          }]);
          
          if (error) throw error;
          console.log('Price update saved to Supabase:', data);
          return { success: true, data };
        } catch (error) {
          console.error('Failed to save price update:', error);
          return { success: false, error };
        }
      },
      getCurrent: async () => {
        try {
          const { data, error } = await supabase.from('current_prices').select('*');
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          console.error('Failed to fetch current prices:', error);
          return { success: false, error };
        }
      }
    },
    analytics: {
      getUserStats: async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('total_members, family_composition, created_at')
            .eq('role', 'user');
          
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          console.error('Failed to fetch user analytics:', error);
          return { success: false, error };
        }
      },
      getOrderStats: async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('total_cost, status, items_count, created_at');
          
          if (error) throw error;
          return { success: true, data };
        } catch (error) {
          console.error('Failed to fetch order analytics:', error);
          return { success: false, error };
        }
      }
    }
  };

  const calculateIngredientRequirements = (composition) => {
    const requirements = {};
    
    Object.entries(weeklyMealPlan).forEach(([day, meals]) => {
      Object.entries(meals).forEach(([mealType, foods]) => {
        foods.forEach(food => {
          const portions = foodPortions[food];
          if (!portions) return;
          
          let totalRequirement = 0;
          ageGroups.forEach(group => {
            const peopleInGroup = composition[group.id] || 0;
            const portionSize = portions.portions[group.id] || 0;
            totalRequirement += peopleInGroup * portionSize;
          });
          
          const ingredients = ingredientBreakdown[food];
          if (ingredients) {
            ingredients.forEach(ingredient => {
              let ingredientAmount = totalRequirement * ingredient.ratio;
              let finalUnit = ingredient.unit;
              
              if (ingredient.unit === 'ml' && ingredientAmount > 1000) {
                ingredientAmount = ingredientAmount / 1000;
                finalUnit = 'ltrs';
              } else if (ingredient.unit === 'g' && ingredientAmount > 1000) {
                ingredientAmount = ingredientAmount / 1000;
                finalUnit = 'kg';
              }
              
              if (!requirements[ingredient.name]) {
                requirements[ingredient.name] = {
                  weeklyNeed: 0,
                  monthlyNeed: 0,
                  unit: finalUnit,
                  cost: ingredientPrices[ingredient.name] || 100
                };
              }
              
              requirements[ingredient.name].weeklyNeed += ingredientAmount;
            });
          } else {
            let ingredientAmount = totalRequirement;
            let finalUnit = portions.unit;
            
            if (portions.unit === 'ml' && ingredientAmount > 1000) {
              ingredientAmount = ingredientAmount / 1000;
              finalUnit = 'ltrs';
            } else if (portions.unit === 'g' && ingredientAmount > 1000) {
              ingredientAmount = ingredientAmount / 1000;
              finalUnit = 'kg';
            }
            
            if (!requirements[food]) {
              requirements[food] = {
                weeklyNeed: 0,
                monthlyNeed: 0,
                unit: finalUnit,
                cost: ingredientPrices[food] || 100
              };
            }
            
            requirements[food].weeklyNeed += ingredientAmount;
          }
        });
      });
    });

    Object.keys(requirements).forEach(ingredientName => {
      const ingredient = requirements[ingredientName];
      ingredient.monthlyNeed = Math.round(ingredient.weeklyNeed * 4.33 * 100) / 100;
      ingredient.weeklyNeed = Math.round(ingredient.weeklyNeed * 100) / 100;
      ingredient.currentStock = Math.round(ingredient.monthlyNeed * Math.random());
    });
    
    return requirements;
  };

  useEffect(() => {
    const demoUsers = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "0712345678",
        building: "Building A",
        houseNumber: "A12",
        password: "user123",
        role: "user",
        familyComposition: { infants: 0, toddlers: 1, children: 1, teens: 0, adults: 2 }
      },
      {
        id: 2,
        name: "Admin User",
        email: "admin@store.com",
        phone: "0711111111",
        building: "Store Location",
        houseNumber: "S1",
        password: "meide2025",
        role: "admin",
        familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
      }
    ];
    setUsers(demoUsers);

    const demoIngredients = calculateIngredientRequirements(demoUsers[0].familyComposition);
    setUserIngredients({ 1: demoIngredients });
  }, []);

  // Component methods
  const doLogin = () => {
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(user.role === 'admin' ? 'admin' : 'user');
      setActiveTab(user.role === 'admin' ? 'overview' : 'profile');
    } else {
      alert('Invalid credentials!');
    }
  };

  const doSignup = () => {
    if (users.find(u => u.email === signupData.email)) {
      alert('Email already exists!');
      return;
    }

    const newUser = {
      id: users.length + 1,
      name: signupData.name,
      email: signupData.email,
      phone: signupData.phone,
      building: signupData.building,
      houseNumber: signupData.houseNumber,
      password: signupData.password,
      familyComposition: signupData.familyComposition,
      role: 'user'
    };
    
    setUsers(prev => [...prev, newUser]);
    
    const userIngredientNeeds = calculateIngredientRequirements(signupData.familyComposition);
    setUserIngredients(prev => ({ ...prev, [newUser.id]: userIngredientNeeds }));
    
    database.users.create(newUser);
    
    alert('Account created! Please login.');
    setCurrentView('login');
    setSignupData({
      name: '', email: '', phone: '', building: '', houseNumber: '', password: '',
      familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
    });
  };

  const doLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setActiveTab('profile');
    setLoginData({ email: '', password: '' });
  };

  const updateFamilyCount = (groupId, change) => {
    setSignupData(prev => ({
      ...prev,
      familyComposition: {
        ...prev.familyComposition,
        [groupId]: Math.max(0, (prev.familyComposition[groupId] || 0) + change)
      }
    }));
  };

  const quickLogin = (email, password) => {
    setLoginData({ email, password });
    setCurrentView('login');
  };

  const updateIngredientStock = (ingredient, newStock) => {
    setUserIngredients(prev => ({
      ...prev,
      [currentUser.id]: {
        ...prev[currentUser.id],
        [ingredient]: { ...prev[currentUser.id][ingredient], currentStock: newStock }
      }
    }));
  };

  const updateIngredientPrice = (ingredient, newPrice) => {
    const oldPrice = ingredientPrices[ingredient];
    setIngredientPrices(prev => ({ ...prev, [ingredient]: newPrice }));
    
    Object.keys(userIngredients).forEach(userId => {
      if (userIngredients[userId][ingredient]) {
        setUserIngredients(prev => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            [ingredient]: { ...prev[userId][ingredient], cost: newPrice }
          }
        }));
      }
    });

    if (oldPrice !== newPrice) {
      database.prices.logUpdate(ingredient, oldPrice, newPrice);
    }
  };

  const resetStock = () => {
    const userIngredientNeeds = calculateIngredientRequirements(currentUser.familyComposition);
    Object.keys(userIngredientNeeds).forEach(ingredientName => {
      userIngredientNeeds[ingredientName].currentStock = userIngredientNeeds[ingredientName].monthlyNeed;
    });
    
    setUserIngredients(prev => ({ ...prev, [currentUser.id]: userIngredientNeeds }));
    alert('Stock reset successfully!');
  };

  const createOrder = () => {
    const ingredients = userIngredients[currentUser.id] || {};
    const lowItems = Object.entries(ingredients)
      .filter(([_, data]) => data.currentStock < data.monthlyNeed * 0.2)
      .map(([ingredient, data]) => ({
        item: ingredient,
        needed: Math.round((data.monthlyNeed - data.currentStock) * 100) / 100,
        unit: data.unit,
        cost: data.cost
      }));

    if (lowItems.length === 0) {
      alert('No ingredients need restocking!');
      return;
    }

    const order = {
      id: orders.length + 1,
      userId: currentUser.id,
      userName: currentUser.name,
      items: lowItems,
      totalCost: Math.round(lowItems.reduce((sum, item) => sum + (item.needed * item.cost), 0)),
      status: 'pending',
      date: new Date().toLocaleDateString()
    };

    setOrders(prev => [...prev, order]);
    database.orders.create(order);
    alert(`Order created with ${lowItems.length} ingredients!`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Meide Meal Plan Manager</h1>
            <p className="text-gray-600">Weekly meal planning & ingredient tracking</p>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => setCurrentView('login')}
              className={`flex-1 py-2 px-4 rounded-l-lg ${currentView === 'login' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className={`flex-1 py-2 px-4 rounded-r-lg ${currentView === 'signup' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              Sign Up
            </button>
          </div>

          {currentView === 'login' ? (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={doLogin}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={signupData.name}
                onChange={(e) => setSignupData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData(prev => ({...prev, email: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={signupData.phone}
                onChange={(e) => setSignupData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Building"
                  value={signupData.building}
                  onChange={(e) => setSignupData(prev => ({...prev, building: e.target.value}))}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="House"
                  value={signupData.houseNumber}
                  onChange={(e) => setSignupData(prev => ({...prev, houseNumber: e.target.value}))}
                  className="w-24 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Family Composition</h3>
                {ageGroups.map(group => (
                  <div key={group.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{group.name}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateFamilyCount(group.id, -1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {signupData.familyComposition[group.id]}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateFamilyCount(group.id, 1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  Total: {Object.values(signupData.familyComposition).reduce((sum, count) => sum + count, 0)} members
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({...prev, password: e.target.value}))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={doSignup}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Create Account
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-semibold mb-2">Quick Login:</p>
            <button 
              onClick={() => quickLogin('john@example.com', 'user123')}
              className="block w-full text-left text-blue-600 hover:text-blue-800 mb-1"
            >
              User: john@example.com / user123
            </button>
            <button 
              onClick={() => quickLogin('admin@store.com', 'meide2025')}
              className="block w-full text-left text-blue-600 hover:text-blue-800"
            >
              Admin: admin@store.com / meide2025
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the app would include all the user and admin interfaces
  // This is a simplified version showing the login interface
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
            Meide Meal Plan Manager
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Welcome {currentUser.name}! The app is working with Tailwind CSS.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={doLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;