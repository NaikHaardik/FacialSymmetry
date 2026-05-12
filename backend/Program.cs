var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddHttpClient();

var app = builder.Build();

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { status = "backend running" }));

app.MapPost("/api/analyze", async (HttpRequest request, IHttpClientFactory httpClientFactory) =>
{
    if (!request.HasFormContentType)
        return Results.BadRequest(new { error = "Expected multipart form data." });

    var form = await request.ReadFormAsync();
    var file = form.Files.GetFile("file");

    if (file == null)
        return Results.BadRequest(new { error = "No file uploaded." });

    using var ms = new MemoryStream();
    await file.CopyToAsync(ms);
    ms.Position = 0;

    var client = httpClientFactory.CreateClient();
    client.Timeout = TimeSpan.FromSeconds(60);

    using var content = new MultipartFormDataContent();
    content.Add(new StreamContent(ms), "file", file.FileName);

    var pythonUrl = Environment.GetEnvironmentVariable("PYTHON_SERVICE_URL") 
                    ?? "http://localhost:8000";

    try
    {
        var response = await client.PostAsync($"{pythonUrl}/analyze", content);
        var result = await response.Content.ReadAsStringAsync();
        return Results.Content(result, "application/json");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Could not connect to AI service: {ex.Message}");
    }
});

app.MapPost("/api/recalculate", async (HttpRequest request, IHttpClientFactory httpClientFactory) =>
{
    using var reader = new StreamReader(request.Body);
    var body = await reader.ReadToEndAsync();

    var client = httpClientFactory.CreateClient();

    var pythonUrl = Environment.GetEnvironmentVariable("PYTHON_SERVICE_URL") 
                    ?? "http://localhost:8000";

    using var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");

    try
    {
        var response = await client.PostAsync($"{pythonUrl}/recalculate", content);
        var result = await response.Content.ReadAsStringAsync();
        return Results.Content(result, "application/json");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Could not connect to AI service: {ex.Message}");
    }
});

app.MapFallbackToFile("index.html");

app.Run("http://0.0.0.0:5000");