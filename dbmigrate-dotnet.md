add into folder migrations (file level - file information to be inserted into db)
dotnet ef migrations add AddSales,SalesItem,Payments -p ./src/PosSystem.Infrastructure/PosSystem.Infrastructure.csproj -s ./src/PosSystem.API/PosSystem.API.csproj

apply to database (database level - insert into db the modification based on file information)
dotnet ef database update -p ./src/PosSystem.Infrastructure/PosSystem.Infrastructure.csproj -s ./src/PosSystem.API/PosSystem.API.csproj

