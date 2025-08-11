namespace vuthach111.Model
{
    public class Product
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double Price { get; set; }
        public string Image { get; set; }
        public int CategoryId { get; set; }
        public int Stock { get; set; }
    }
}
