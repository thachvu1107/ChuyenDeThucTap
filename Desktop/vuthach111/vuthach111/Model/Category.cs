using vuthach111.Model;

namespace vuthach111.Model
{
    public class Category
    {
        public int ID { get; set; }
        public string Name { get; set; }


        public List<Product>? Products { get; set; }
    }
}
