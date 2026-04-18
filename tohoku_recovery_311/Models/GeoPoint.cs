// POI data in database
public class GeoPoint
{
    public int Id { get; set; }
    public string Name { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string Prefecture { get; set; }
    public string Code { get; set; }
    public int Category { get; set; }
}