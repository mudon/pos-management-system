PosSystem/
│
├── PosSystem.sln
│
├── src/
│   │
│   ├── PosSystem.API/                 # REST API (Backend)
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── ProductsController.cs
│   │   │   ├── CategoriesController.cs
│   │   │   ├── SuppliersController.cs
│   │   │   ├── InventoryController.cs
│   │   │   ├── SalesController.cs
│   │   │   ├── PaymentsController.cs
│   │   │   └── ReportsController.cs
│   │   │
│   │   ├── Middleware/
│   │   │   ├── ExceptionMiddleware.cs
│   │   │   └── JwtMiddleware.cs
│   │   │
│   │   ├── Filters/
│   │   │   └── AuthorizeRoleAttribute.cs
│   │   │
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── PosSystem.API.csproj
│   │
│   ├── PosSystem.Application/        # Business Logic Layer
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequestDto.cs
│   │   │   │   ├── LoginResponseDto.cs
│   │   │   │   └── RefreshTokenDto.cs
│   │   │   ├── Users/
│   │   │   ├── Products/
│   │   │   ├── Inventory/
│   │   │   ├── Sales/
│   │   │   └── Payments/
│   │   │
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── IProductService.cs
│   │   │   ├── IInventoryService.cs
│   │   │   ├── ISalesService.cs
│   │   │   └── IPaymentService.cs
│   │   │
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── UserService.cs
│   │   │   ├── ProductService.cs
│   │   │   ├── InventoryService.cs
│   │   │   ├── SalesService.cs
│   │   │   └── PaymentService.cs
│   │   │
│   │   ├── Helpers/
│   │   │   ├── PasswordHasher.cs
│   │   │   ├── JwtTokenGenerator.cs
│   │   │   └── BarcodeHelper.cs
│   │   │
│   │   └── PosSystem.Application.csproj
│   │
│   ├── PosSystem.Domain/             # Core Business Entities
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── RefreshToken.cs
│   │   │   ├── Product.cs
│   │   │   ├── Category.cs
│   │   │   ├── Supplier.cs
│   │   │   ├── Inventory.cs
│   │   │   ├── Sale.cs
│   │   │   ├── SaleItem.cs
│   │   │   ├── Payment.cs
│   │   │   └── InventoryLog.cs
│   │   │
│   │   ├── Enums/
│   │   │   ├── UserRole.cs
│   │   │   └── PaymentMethod.cs
│   │   │
│   │   └── PosSystem.Domain.csproj
│   │
│   ├── PosSystem.Infrastructure/     # Database + External Services
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── DbInitializer.cs
│   │   │   └── Migrations/
│   │   │
│   │   ├── Configurations/
│   │   │   ├── UserConfiguration.cs
│   │   │   ├── ProductConfiguration.cs
│   │   │   └── SaleConfiguration.cs
│   │   │
│   │   ├── Repositories/
│   │   │   ├── GenericRepository.cs
│   │   │   ├── UserRepository.cs
│   │   │   ├── ProductRepository.cs
│   │   │   ├── InventoryRepository.cs
│   │   │   └── SalesRepository.cs
│   │   │
│   │   ├── UnitOfWork/
│   │   │   ├── IUnitOfWork.cs
│   │   │   └── UnitOfWork.cs
│   │   │
│   │   └── PosSystem.Infrastructure.csproj
│   │
│   ├── PosSystem.Dashboard/           # Admin & Cashier Dashboard
│   │   ├── Controllers/
│   │   │   ├── DashboardController.cs
│   │   │   ├── ProductsController.cs
│   │   │   ├── InventoryController.cs
│   │   │   ├── SalesController.cs
│   │   │   └── UsersController.cs
│   │   │
│   │   │
│   │   ├── wwwroot/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   └── images/
│   │   │

│

