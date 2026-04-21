using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MindHub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddNodeSizeAndCodeBlockState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "Height",
                table: "Nodes",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<bool>(
                name: "IsCodeBlockOpen",
                table: "Nodes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<float>(
                name: "Width",
                table: "Nodes",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Height",
                table: "Nodes");

            migrationBuilder.DropColumn(
                name: "IsCodeBlockOpen",
                table: "Nodes");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "Nodes");
        }
    }
}
