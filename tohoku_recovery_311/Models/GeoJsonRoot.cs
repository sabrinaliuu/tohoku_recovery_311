// POI geojson
public class GeoJsonRoot
{
    public List<Feature> features { get; set; }
}

public class Feature
{
    public Geometry geometry { get; set; }
    public Properties properties { get; set; }
}

public class Geometry
{
    public List<double> coordinates { get; set; }
}

public class Properties
{
    public string Name { get; set; }
    public string Prefecture { get; set; }
    public string Code { get; set; }
    public int Level { get; set; }
    public int Id { get; set; }

}