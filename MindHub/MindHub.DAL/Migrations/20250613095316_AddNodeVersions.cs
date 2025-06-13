using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MindHub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddNodeVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NodeVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MapId = table.Column<string>(type: "text", nullable: false),
                    NodeId = table.Column<string>(type: "text", nullable: false),
                    Data = table.Column<string>(type: "text", nullable: false),
                    ChangedBy = table.Column<string>(type: "text", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    RecordStatus = table.Column<byte>(type: "smallint", nullable: false),
                    RecordCreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecordUpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NodeVersions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NodeVersions_RecordCreateDate",
                table: "NodeVersions",
                column: "RecordCreateDate");

            migrationBuilder.CreateIndex(
                name: "IX_NodeVersions_RecordStatus",
                table: "NodeVersions",
                column: "RecordStatus");

            migrationBuilder.CreateIndex(
                name: "IX_NodeVersions_RecordUpdateDate",
                table: "NodeVersions",
                column: "RecordUpdateDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NodeVersions");
        }
    }
}
