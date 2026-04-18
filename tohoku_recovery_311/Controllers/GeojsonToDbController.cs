// read POI geojson to database
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using tohoku_recovery_311.Data;
using tohoku_recovery_311.Models;

public class GeojsonToDbController : Controller
{
    private readonly ApplicationDbContext _context;

    public GeojsonToDbController(ApplicationDbContext context)
    {
        _context = context;
    }

    public IActionResult ImportFromFile()
    {
        var path = Path.Combine(Directory.GetCurrentDirectory(),
                                "wwwroot/data/311.geojson");

        var json = System.IO.File.ReadAllText(path);

        var geojson = JsonSerializer.Deserialize<GeoJsonRoot>(json);

        foreach (var f in geojson.features)
        {
            var point = new GeoPoint
            {
                Name = f.properties.Name,
                Longitude = f.geometry.coordinates[0],
                Latitude = f.geometry.coordinates[1],
                Prefecture = f.properties.Prefecture,
                Category = f.properties.Level,
                Code = f.properties.Code
            };

            _context.GeoPoints.Add(point);
        }

        _context.SaveChanges();

        return Content("Import done");
    }
}