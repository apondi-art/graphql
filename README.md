# GraphQL Learning Profile

A dynamic profile page built with GraphQL that displays personal learning statistics and progress data from the Zone01 Kisumu platform.

## 🎯 Objectives

This project demonstrates proficiency in GraphQL query language by creating a personalized profile page that connects to the Zone01 Kisumu GraphQL endpoint to fetch and display user data.

## ✨ Features

### Authentication
- **Secure Login System**: Supports both username/password and email/password authentication
- **JWT Token Management**: Uses Bearer authentication for secure API access
- **Session Management**: Includes logout functionality with proper token cleanup

### Profile Information
- **Basic User Data**: Username, email, and membership date
- **Learning Statistics**: Total XP based on transactions, audit ratio, and completed projects
- **Progress Tracking**: Real-time data from the learning platform

### Interactive Data Visualization
- **XP Progress Over Time**: SVG-based line chart showing learning progression
- **Audit Ratio Analysis**: Visual representation of audit performance
- **Project XP Distribution**: Chart displaying XP earned per project
- **Responsive Charts**: Interactive and animated SVG graphs

## 🛠 Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **API**: GraphQL with JWT authentication
- **Visualization**: Custom SVG charts and graphs
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Architecture**: Modular JavaScript with separate concerns

## 📊 Data Sources

The application queries the following GraphQL tables:

### User Table
```graphql
{
  user {
    id
    login
    # Basic user identification
  }
}
```

### Transaction Table
```graphql
{
  transaction(where: {type: {_eq: "xp"}}) {
    amount
    createdAt
    path
    objectId
    # XP tracking and audit data
  }
}
```

### Progress Table
```graphql
{
  progress {
    grade
    createdAt
    path
    # Project completion tracking
  }
}
```

### Object Table
```graphql
{
  object {
    name
    type
    # Project and exercise information
  }
}
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Valid Zone01 Kisumu account credentials
- Internet connection for API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/apondi-art/graphql.git
   cd graphql-learning
   ```
 **Clone the repository**
 Copy this to  your browser, https://apondi-art.github.io/graphql/.

2. **Open the application**
   ```bash
   # Serve the files using a local server
   # For example, using Python:
   python -m http.server 8000
   
   # Or using Node.js live-server:
   npx live-server
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:5500`

### Usage

1. **Login**: Enter your Zone01 Kisumu credentials (username/email and password)
2. **Explore Profile**: View your basic information and learning statistics
3. **Analyze Progress**: Interact with the various charts and graphs
4. **Logout**: Use the logout button to securely end your session

## 📈 GraphQL Queries

### Authentication Query Example
```graphql
query($userId: Int!) {
  user(where: {id: {_eq: $userId}}) {
    id
    login
    email
  }
}
```

### XP Data Query Example
```graphql
query($userId: Int!) {
  transaction(
    where: {
      type: {_eq: "xp"},
      userId: {_eq: $userId},
      object: {type: {_in: ["project", "exercise"]}},
      path: {_nlike: "%piscine%"}
    },
    order_by: {createdAt: asc}
  ) {
    amount
    createdAt
    path
    object {
      name
      type
    }
  }
}
```

### Audit Ratio Query Example
```graphql
query($userId: Int!) {
  transaction(
    where: {
      type: {_in: ["up", "down"]},
      userId: {_eq: $userId}
    }
  ) {
    type
    amount
  }
}
```

## 🎨 Design Features

- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, transitions, and dynamic content
- **Accessibility**: Proper contrast ratios and semantic HTML structure
- **Performance**: Optimized loading and efficient data rendering

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

## 🔧 File Structure

```
graphql-learning-profile/
├── index.html              # Main HTML file
├── front-end-files/
│   └── style.css          # Styles and animations
├── src/
│   ├── app.js             # Main application logic
│   ├── auth.js            # Authentication handling
│   ├── api.js             # GraphQL API interactions
│   └── charts.js          # SVG chart generation
└── README.md              # Project documentation
```

## 🌐 Hosting

This project can be hosted on various platforms:
- **GitHub Pages**: Free static hosting


## 🔒 Security Features

- **JWT Token Handling**: Secure token storage and transmission
- **Input Validation**: Client-side validation for user inputs
- **Error Handling**: Proper error messages for failed authentication
- **Session Management**: Automatic logout on token expiration

## 📚 Learning Outcomes

This project demonstrates understanding of:
- **GraphQL**: Query language and API interaction
- **JWT Authentication**: Token-based security implementation
- **Data Visualization**: Creating interactive charts with SVG
- **Modern JavaScript**: ES6+ features and modular architecture
- **Responsive Design**: Mobile-first CSS development
- **UI/UX Principles**: User-centered design approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Zone01 Kisumu curriculum and is intended for educational purposes. [LICENSE](LICENSE)

