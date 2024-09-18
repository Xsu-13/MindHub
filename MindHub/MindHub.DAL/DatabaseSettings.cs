namespace MindHub.DAL
{
    public class DatabaseSettings
    {
        public string ConnectionString { get; set; }
        public bool MigrateOnStartup { get; set; }
    }
}
