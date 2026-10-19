using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MonikaAdmin.Api.Options;
using MonikaAdmin.Business.Services;
using MonikaAdmin.Core.Interfaces.Business;
using MonikaAdmin.Core.Interfaces.Repository;
using MonikaAdmin.Repository;

var builder = WebApplication.CreateBuilder(args);

// DbContext: a connection stringet csak az első feloldáskor olvassa, így a build közbeni
// OpenAPI-generálás adatbázis nélkül is lefut.
builder.Services.AddDbContext<MonikaAdminDbContext>((serviceProvider, options) =>
{
    var connectionString = serviceProvider.GetRequiredService<IConfiguration>().GetConnectionString("MonikaAdmin")
        ?? throw new InvalidOperationException("Missing connection string 'ConnectionStrings:MonikaAdmin'.");
    options.UseSqlServer(connectionString);
});

// Konfiguráció
builder.Services.Configure<FrontendOptions>(builder.Configuration.GetSection(FrontendOptions.SectionName));
builder.Services.AddOptions<CorsOptions>()
    .Configure<IOptions<FrontendOptions>>((cors, frontend) =>
    {
        cors.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(frontend.Value.AllowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });

// Repositoryk
builder.Services.AddScoped<IUnitOfWork>(serviceProvider => serviceProvider.GetRequiredService<MonikaAdminDbContext>());
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Business service-ek
builder.Services.AddScoped<IVideoService, VideoService>();
builder.Services.AddScoped<ISegmentService, SegmentService>();

// Web API
// A validációs hibák kulcsai a JSON mezőnevei (camelCase), nem a C# property-k
builder.Services.AddControllers(options => options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider()));
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddCors();
builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
