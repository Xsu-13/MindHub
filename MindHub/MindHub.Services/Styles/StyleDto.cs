using MindHub.DAL;

namespace MindHub.Services.Styles
{
    public class StyleDto
    {
        public int Id { get; set; }
        public string BackgroundColor { get; set; }
        public string TextColor { get; set; }
        public string BorderColor { get; set; }
        public int FontSize { get; set; }
        public string FontFamily { get; set; }
    }
}
