# EventPulse - Event Management System

A comprehensive full-stack event management system built with Spring Boot and Bootstrap that allows users to discover, create, register for, and manage events with QR code ticket generation and verification.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.1-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### Core Features
- **User Management**
  - User registration with role-based access (Attendee/Organizer)
  - Secure authentication using Spring Security with Basic Auth
  - Session management and user profile handling

- **Event Management**
  - Create events with detailed information (title, description, date, location, images)
  - Browse and search events with filtering capabilities
  - Image upload support for event promotion
  - Date validation to ensure events are scheduled in the future

- **Registration System**
  - One-click event registration for authenticated users
  - Registration status tracking and management
  - Ability to unregister from events
  - Registration history and personal dashboard

- **QR Code Ticketing**
  - Automatic QR code generation for each registration
  - Digital ticket with QR codes for seamless check-in
  - QR code verification system for event organizers
  - Printable tickets with complete event details

- **Email Notifications**
  - Automated confirmation emails upon registration
  - Email integration with customizable templates
  - QR code delivery via email

- **Responsive Web Interface**
  - Modern, mobile-first design using Bootstrap 5
  - Single-page application experience with tab navigation
  - Real-time UI updates and form validation
  - Intuitive user experience with loading states and feedback

## 🛠️ Technologies Used

### Backend
- **Spring Boot 3.1.1** - Main application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence layer
- **Spring Boot Mail** - Email functionality
- **MySQL** - Primary database
- **Lombok** - Reducing boilerplate code
- **ZXing (3.4.1)** - QR code generation
- **Thymeleaf** - Server-side template engine
- **Maven** - Dependency management and build tool

### Frontend
- **Bootstrap 5.3.0** - UI framework and responsive design
- **Bootstrap Icons** - Icon library
- **Vanilla JavaScript** - Frontend interactivity
- **Google Fonts** - Typography (Poppins, Montserrat)
- **HTML5 & CSS3** - Markup and styling

### Development Tools
- **Java 17** - Programming language
- **Maven Compiler Plugin** - Java compilation
- **Spring Boot Maven Plugin** - Application packaging

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Java JDK 17 or higher**
- **MySQL 8.0 or higher**
- **Maven 3.6 or higher**
- **Git** (for cloning the repository)

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 1GB free space
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/azibmalik/eventpulse.git
cd eventpulse
```

### 2. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE eventpulse;
CREATE USER 'eventpulse_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON eventpulse.* TO 'eventpulse_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Configure Database Connection
1. Copy the template configuration file:
```bash
cp src/main/resources/application.properties.template src/main/resources/application.properties
```

2. Edit `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/eventpulse
spring.datasource.username=eventpulse_user
spring.datasource.password=your_secure_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Email Configuration (Gmail Example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application Configuration
server.port=8080
```

### 3. Email Configuration (Optional but Recommended)

For Gmail, you'll need to:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in the configuration

For other email providers, adjust the SMTP settings accordingly.

### 4. Build and Run

#### Using Maven
```bash
# Clean and compile
mvn clean compile

# Run the application
mvn spring-boot:run
```

#### Using Java JAR
```bash
# Build the JAR file
mvn clean package

# Run the JAR
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### 5. Access the Application
Open your web browser and navigate to: `http://localhost:8080`

## 📊 Database Schema

The application automatically creates the following tables:

### Users Table
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(255) NOT NULL
);
```

### Events Table
```sql
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT(2048),
    start_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_base64 LONGTEXT,
    organizer_id BIGINT,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);
```

### Registrations Table
```sql
CREATE TABLE registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT,
    user_id BIGINT,
    registration_date DATETIME NOT NULL,
    qr_code_base64 TEXT(5000),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "ROLE_ATTENDEE"
}
```

#### Login
```http
GET /api/auth/login
Authorization: Basic base64(username:password)
```

### Event Endpoints

#### Get All Events
```http
GET /api/events/all
Authorization: Basic base64(username:password)
```

#### Get Event by ID
```http
GET /api/events/{id}
Authorization: Basic base64(username:password)
```

#### Create Event
```http
POST /api/events/create
Authorization: Basic base64(username:password)
Content-Type: application/json

{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "startDate": "2024-12-15T09:00:00",
    "location": "Convention Center",
    "imageBase64": "base64_encoded_image_data"
}
```

### Registration Endpoints

#### Register for Event
```http
POST /api/registrations/register/{eventId}
Authorization: Basic base64(username:password)
```

#### Unregister from Event
```http
DELETE /api/registrations/unregister/{eventId}
Authorization: Basic base64(username:password)
```

#### Get User Registrations
```http
GET /api/registrations/my-registrations
Authorization: Basic base64(username:password)
```

### Verification Endpoint

#### Verify QR Code
```http
GET /verify?code={eventId}_{userId}
```

## 🎨 Frontend Features

### Single Page Application
- **Tab-based Navigation**: Seamless switching between Home, Events, Create Event, and My Registrations
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Real-time Updates**: Dynamic content loading without page refreshes

### User Interface Components
- **Authentication Forms**: Login and registration with validation
- **Event Cards**: Visual event display with images and key information
- **Modal Dialogs**: Event details with registration functionality
- **Search and Filtering**: Event discovery tools
- **QR Code Display**: Integrated ticket viewing and printing

### Interactive Features
- **Password Toggle**: Show/hide password functionality
- **Form Validation**: Client and server-side validation
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Confirmation messages

## 📁 Project Structure

```
eventpulse/
├── src/
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── EventController.java
│   │   │   │   ├── HomeController.java
│   │   │   │   ├── RegistrationController.java
│   │   │   │   └── VerificationController.java
│   │   │   ├── model/
│   │   │   │   ├── Event.java
│   │   │   │   ├── Registration.java
│   │   │   │   └── User.java
│   │   │   ├── repository/
│   │   │   │   ├── EventRepository.java
│   │   │   │   ├── RegistrationRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── service/
│   │   │   │   ├── EmailService.java
│   │   │   │   ├── EventService.java
│   │   │   │   └── QRCodeService.java
│   │   │   └── DemoApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   │   └── styles.css
│   │       │   ├── js/
│   │       │   │   └── app.js
│   │       │   └── index.html
│   │       ├── templates/
│   │       │   ├── verification.html
│   │       │   ├── verification-error.html
│   │       │   └── home.html
│   │       ├── application.properties
│   │       └── application.properties.template
├── pom.xml
├── .gitignore
└── README.md
```

## 🔒 Security Features

### Authentication & Authorization
- **Spring Security Integration**: Comprehensive security framework
- **Basic Authentication**: Secure credential transmission
- **Role-Based Access Control**: Attendee and Organizer roles
- **Password Encryption**: BCrypt password hashing
- **Session Management**: Secure session handling

### Data Protection
- **Input Validation**: Server-side and client-side validation
- **SQL Injection Prevention**: JPA/Hibernate query protection
- **XSS Protection**: Output encoding and sanitization
- **CSRF Protection**: Cross-site request forgery prevention (configurable)

### Security Headers
- **Custom Security Configuration**: Tailored security rules
- **Protected Endpoints**: Authentication required for sensitive operations
- **Public Access**: Controlled public access to landing pages

## 🧪 Testing

### Manual Testing Checklist

#### User Registration & Authentication
- [ ] Register new user with valid credentials
- [ ] Login with registered credentials
- [ ] Test invalid login attempts
- [ ] Verify role-based access (Attendee vs Organizer)

#### Event Management
- [ ] Create new event with all fields
- [ ] Create event with image upload
- [ ] Validate future date requirement
- [ ] Browse all events
- [ ] Search events by title

#### Registration System
- [ ] Register for an event
- [ ] View registration in "My Registrations"
- [ ] Unregister from an event
- [ ] Test duplicate registration prevention

#### QR Code & Verification
- [ ] Generate QR code upon registration
- [ ] Verify QR code through verification URL
- [ ] Test invalid verification codes
- [ ] Print ticket functionality

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```
Error: Access denied for user 'root'@'localhost'
```
**Solution**: Verify MySQL credentials in `application.properties` and ensure the database user has proper permissions.

#### Email Configuration Issues
```
Error: Authentication failed
```
**Solution**: 
- For Gmail, ensure 2FA is enabled and use an App Password
- Check SMTP settings for your email provider
- Verify firewall settings allow SMTP traffic

#### Port Already in Use
```
Error: Port 8080 was already in use
```
**Solution**: 
- Change the port in `application.properties`: `server.port=8081`
- Or stop the process using port 8080

#### Maven Build Issues
```
Error: Could not resolve dependencies
```
**Solution**:
- Clear Maven cache: `mvn clean`
- Update dependencies: `mvn dependency:resolve`
- Check internet connection and proxy settings

### Performance Optimization

#### Database Optimization
- Add indexes for frequently queried fields
- Configure connection pooling
- Enable query caching for better performance

#### Frontend Optimization
- Minimize JavaScript and CSS files
- Optimize images before upload
- Implement lazy loading for large event lists

## 🔧 Configuration Options

### Application Properties
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/

# Database Configuration
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# File Upload Configuration
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=2MB

# Logging Configuration
logging.level.com.example.demo=DEBUG
logging.file.name=logs/application.log
```

### Environment-Specific Configurations

#### Development
- Enable detailed logging
- Use H2 in-memory database for testing
- Disable email sending (use console output)

#### Production
- Enable SSL/HTTPS
- Configure proper database connection pooling
- Set up email relay service
- Enable security headers

## 🚀 Deployment

### Local Development
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Production Deployment

#### Using Docker
```dockerfile
FROM openjdk:17-jre-slim
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### Using JAR File
```bash
java -jar -Dspring.profiles.active=prod target/demo-0.0.1-SNAPSHOT.jar
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Write tests for new functionality
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

### Coding Standards
- Follow Java naming conventions
- Use Lombok annotations to reduce boilerplate
- Write meaningful commit messages
- Document new API endpoints
- Ensure responsive design for frontend changes

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered

## 📈 Future Enhancements

### Planned Features
- [ ] **Event Categories**: Organize events by categories (Technology, Sports, Arts, etc.)
- [ ] **Event Search**: Advanced search with filters (date range, location, category)
- [ ] **Event Capacity**: Limit registration numbers and waitlist functionality
- [ ] **Payment Integration**: Paid events with Stripe/PayPal integration
- [ ] **Social Features**: Event comments, ratings, and social sharing
- [ ] **Mobile App**: React Native or Flutter mobile application
- [ ] **Analytics Dashboard**: Event organizer analytics and reporting
- [ ] **Notification System**: Real-time notifications and reminders
- [ ] **Calendar Integration**: Export events to Google Calendar/Outlook
- [ ] **Multi-language Support**: Internationalization (i18n)

### Technical Improvements
- [ ] **API Versioning**: RESTful API versioning strategy
- [ ] **Caching**: Redis caching for improved performance
- [ ] **File Storage**: Cloud storage for event images (AWS S3, Cloudinary)
- [ ] **Security Enhancements**: JWT tokens, OAuth2 integration
- [ ] **Testing**: Comprehensive unit and integration tests
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Monitoring**: Application monitoring and logging (ELK stack)
- [ ] **Database Migration**: Flyway or Liquibase for database versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spring Boot Team** for the excellent framework
- **Bootstrap Team** for the responsive UI components
- **ZXing Project** for QR code generation capabilities
- **MySQL Community** for the reliable database system

---

**EventPulse** - Bringing people together through memorable events. 🎉

Created with ❤️
