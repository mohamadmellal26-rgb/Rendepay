namespace RendePayUI.Models
{
    public class Card
    {
        public long? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public decimal Balance { get; set; }
    }
}