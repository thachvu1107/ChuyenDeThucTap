using Microsoft.EntityFrameworkCore;
using vuthach111.Model;

namespace vuthach111.Data
{

    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }


        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Category> Category { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartDetail> CartDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Thiết lập quan hệ: Category - Product
            modelBuilder.Entity<Product>()
                        .HasOne<Category>()
                        .WithMany(c => c.Products)
                        .HasForeignKey(p => p.CategoryId);

            // Order - User
            modelBuilder.Entity<Order>()
                        .HasOne(o => o.User)
                        .WithMany()
                        .HasForeignKey(o => o.UserId);

            // OrderDetail - Order
            modelBuilder.Entity<OrderDetail>()
                        .HasOne(od => od.Order)
                        .WithMany(o => o.OrderDetails)
                        .HasForeignKey(od => od.OrderId);

            // OrderDetail - Product
            modelBuilder.Entity<OrderDetail>()
                        .HasOne(od => od.Product)
                        .WithMany()
                        .HasForeignKey(od => od.ProductId);
            // ✅ Cart - User
            modelBuilder.Entity<Cart>()
                      .HasOne(c => c.User)
                      .WithMany()
                      .HasForeignKey(c => c.UserId);


            // ✅ CartDetail - Cart
            modelBuilder.Entity<CartDetail>()
                        .HasOne(cd => cd.Cart)
                        .WithMany(c => c.CartDetails)
                        .HasForeignKey(cd => cd.CartId);

            // ✅ CartDetail - Product
            modelBuilder.Entity<CartDetail>()
                        .HasOne(cd => cd.Product)
                        .WithMany()
                        .HasForeignKey(cd => cd.ProductId);

        }

    }
}