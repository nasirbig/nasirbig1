# 🏋️ Fitness Tracker App

A comprehensive React Native fitness tracking application built with Expo, featuring workout logging, progress tracking, and body weight monitoring.

## ✨ Features

### 🏠 Home Screen
- **Today's Workout Progress**: Circular progress bar showing completion percentage
- **Body Weight Tracking**: Current weight display with edit functionality
- **3-Month Workout Calendar**: Heatmap showing workout consistency
- **Step Counter**: Daily step tracking with customizable targets
- **Smart Settings**: Theme switching and unit preferences (kg/lbs)
- **Profile Management**: User profile with logout functionality

### 📓 Training Log
- **Complete Workout History**: Chronological list of all workouts
- **Detailed Workout Cards**: Exercise completion status, muscle groups, and step count
- **Interactive Workout Details**: Tap to view full exercise breakdown
- **Progress Indicators**: Visual completion status for each workout
- **Exercise Previews**: Quick overview of exercises and sets/reps

### 📈 Progress Screen
- **Weight Tracking Graph**: Interactive line chart with multiple time periods (7, 30, 90 days)
- **Trend Analysis**: Weight change indicators with direction and percentage
- **Calendar Integration**: 1-month heatmap for weight entries
- **Statistical Overview**: Total entries, monthly summaries, and workout counts
- **Data Point Interaction**: Tap chart points to view specific weight entries

### ⚙️ Workout Setup
- **Exercise Management**: Create, edit, and delete custom exercises
- **Day-wise Routine Setup**: Assign exercises to specific days of the week
- **Flexible Scheduling**: Multiple day assignments per workout routine
- **Exercise Library**: Expandable list with muscle group categorization
- **Routine Customization**: Custom sets, reps, and exercise combinations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FitnessTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6 (Bottom Tabs)
- **State Management**: React Context + useReducer
- **Data Persistence**: AsyncStorage
- **Charts**: react-native-chart-kit
- **Icons**: Expo Vector Icons
- **SVG Support**: react-native-svg

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── Card.tsx        # Card container component
│   ├── Calendar.tsx    # Calendar heatmap component
│   ├── EditButton.tsx  # Styled edit button
│   └── ProgressCircle.tsx # Circular progress indicator
├── context/            # State management
│   └── DataContext.tsx # Global app state with AsyncStorage
├── screens/            # Main app screens
│   ├── HomeScreen.tsx      # Today's progress and overview
│   ├── TrainingLogScreen.tsx # Workout history
│   ├── ProgressScreen.tsx   # Weight tracking and analytics
│   └── SetupScreen.tsx      # Exercise and routine management
├── types/              # TypeScript type definitions
│   └── index.ts        # App-wide interfaces and types
└── utils/              # Utility functions
```

## 🎨 Design Features

- **Dark Theme**: Professionally designed dark color scheme
- **Purple Accent**: Consistent #8B5CF6 purple branding
- **Responsive Layout**: Optimized for various screen sizes
- **Intuitive Navigation**: Clear bottom tab navigation
- **Interactive Elements**: Smooth animations and touch feedback
- **Modern UI**: Card-based layout with rounded corners and shadows

## 📊 Data Models

### Exercise
- Unique ID, name, default sets/reps, muscle group

### Workout
- Date, exercise list, completion status, muscle groups

### Body Weight Entry
- Date, weight value, unit (lbs/kg)

### Step Entry
- Date, steps taken, daily target

### Workout Day Template
- Name, assigned days, exercise configurations

## 🔧 Key Features Implementation

### Real-time Progress Tracking
- Automatic workout creation based on day templates
- Live progress calculation and circular progress bars
- Persistent data storage across app sessions

### Smart Calendar Integration
- Visual workout consistency tracking
- Weight entry calendar with interactive date selection
- Multi-month views for historical data

### Comprehensive Analytics
- Weight trend analysis with directional indicators
- Interactive charts with data point selection
- Statistical summaries and monthly breakdowns

### Flexible Workout Management
- Dynamic exercise library with custom exercises
- Day-wise routine setup with multiple day assignments
- Real-time workout editing and completion tracking

## 🎯 App Flow

1. **Initial Setup**: Users can add exercises and create workout routines
2. **Daily Use**: Check today's workout, log progress, update weight/steps
3. **Progress Tracking**: View historical data, analyze trends, celebrate achievements
4. **Routine Management**: Modify exercises, update routines, customize schedules

## 🚀 Future Enhancements

- [ ] Workout timer functionality
- [ ] Exercise video demonstrations
- [ ] Social sharing and challenges
- [ ] Advanced analytics and insights
- [ ] Cloud synchronization
- [ ] Nutrition tracking integration
- [ ] Wearable device integration

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](issues).

---

**Built with ❤️ using React Native and Expo**