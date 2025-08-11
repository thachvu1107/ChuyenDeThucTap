using Microsoft.AspNetCore.Mvc;
using vuthach111.Data;
using vuthach111.Model;
using System.Linq;
using vuthach111.DTO;


namespace vuthach111.Controllers
{
    [Route("api/[controller]")] 
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách sản phẩm
        [HttpGet]
        public IActionResult GetProducts()
        {
            return Ok(_context.Products.ToList());
        }
        [HttpGet("{id}")]
        public IActionResult GetProductById(int id)
        {
            var product = _context.Products
                .Where(p => p.ID == id)
                .FirstOrDefault(); // Tìm sản phẩm theo ID

            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }


        // Thêm sản phẩm mới
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] ProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var objPro = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                Stock = dto.Stock
            };

            if (dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                string fileName = Path.GetFileName(dto.ImageFile.FileName);
                string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                string filePath = Path.Combine(folderPath, fileName);

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                objPro.Image = "/images/" + fileName;
            }

            _context.Products.Add(objPro);
            await _context.SaveChangesAsync();

            return Ok(objPro);
        }




        // Sửa sản phẩm
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductDto dto)
        {
            var product = _context.Products.FirstOrDefault(p => p.ID == id);
            if (product == null)
                return NotFound();

            product.Name = dto.Name;
            product.Description = dto.Description;

            product.Price = dto.Price;
            product.CategoryId = dto.CategoryId;
            product.Stock = dto.Stock;

            if (dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                string fileName = Path.GetFileName(dto.ImageFile.FileName);
                string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                string filePath = Path.Combine(folderPath, fileName);

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                // Cập nhật đường dẫn ảnh
                product.Image = "/images/" + fileName;
            }

            await _context.SaveChangesAsync();
            return Ok(product);
        }


        // Xóa sản phẩm
        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var product = _context.Products.FirstOrDefault(p => p.ID == id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            _context.SaveChanges();
            return Ok(new { message = "Xóa thành công" });
        }
    }
}
