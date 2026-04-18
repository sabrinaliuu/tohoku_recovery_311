// load POI as geojson from database
using Microsoft.AspNetCore.Mvc;
using tohoku_recovery_311.Data;

[Route("api/geopointdb")]
[ApiController]
public class GeoPointDbController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GeoPointDbController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetPoints()
    {
        var features = _context.GeoPoints.Select(p => new
        {
            type = "Feature",
            geometry = new
            {
                type = "Point",
                coordinates = new[] { p.Longitude, p.Latitude }
            },
            properties = new
            {
                p.Id,
                p.Name,
                p.Prefecture,
                p.Category,
                p.Code
            }
        });

        var geojson = new
        {
            type = "FeatureCollection",
            features = features
        };

        return Ok(geojson);
    }
}