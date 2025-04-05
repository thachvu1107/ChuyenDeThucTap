using vuthach111.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using vuthach111.Data;

namespace vuthach111.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext pro;

        public ProductController(AppDbContext context)
        {
            pro = context;
        }

        // GET: api/Product
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await pro.Products.ToListAsync();
            return Ok(products);
        }

        // GET: api/Product/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var product = await pro.Products.FindAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        // POST: api/Product
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            pro.Products.Add(product);
            await pro.SaveChangesAsync();
            return Ok(product);
        }

        // PUT: api/Product/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Product product)
        {
            var existing = await pro.Products.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = product.Name;
            existing.Price = product.Price;
            existing.Image = product.Image;

            pro.Products.Update(existing);
            await pro.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/Product/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await pro.Products.FindAsync(id);
            if (product == null) return NotFound();

            pro.Products.Remove(product);
            await pro.SaveChangesAsync();
            return Ok(new { message = "Deleted successfully" });
        }
    }
}