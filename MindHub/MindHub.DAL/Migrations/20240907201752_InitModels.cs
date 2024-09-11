using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MindHub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class InitModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Styles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BackgroundColor = table.Column<string>(type: "text", nullable: false),
                    TextColor = table.Column<string>(type: "text", nullable: false),
                    BorderColor = table.Column<string>(type: "text", nullable: false),
                    FontSize = table.Column<int>(type: "integer", nullable: false),
                    FontFamily = table.Column<string>(type: "text", nullable: false),
                    RecordStatus = table.Column<byte>(type: "smallint", nullable: false),
                    RecordCreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecordUpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Styles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    RecordStatus = table.Column<byte>(type: "smallint", nullable: false),
                    RecordCreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecordUpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Maps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    RecordStatus = table.Column<byte>(type: "smallint", nullable: false),
                    RecordCreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecordUpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Maps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Maps_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Nodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MapId = table.Column<int>(type: "integer", nullable: false),
                    ParentNodeId = table.Column<int>(type: "integer", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    X = table.Column<float>(type: "real", nullable: false),
                    Y = table.Column<float>(type: "real", nullable: false),
                    StyleId = table.Column<int>(type: "integer", nullable: true),
                    RecordStatus = table.Column<byte>(type: "smallint", nullable: false),
                    RecordCreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RecordUpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Nodes_Maps_MapId",
                        column: x => x.MapId,
                        principalTable: "Maps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Nodes_Nodes_ParentNodeId",
                        column: x => x.ParentNodeId,
                        principalTable: "Nodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Nodes_Styles_StyleId",
                        column: x => x.StyleId,
                        principalTable: "Styles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Maps_RecordCreateDate",
                table: "Maps",
                column: "RecordCreateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Maps_RecordStatus",
                table: "Maps",
                column: "RecordStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Maps_RecordUpdateDate",
                table: "Maps",
                column: "RecordUpdateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Maps_UserId",
                table: "Maps",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_MapId",
                table: "Nodes",
                column: "MapId");

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_ParentNodeId",
                table: "Nodes",
                column: "ParentNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_RecordCreateDate",
                table: "Nodes",
                column: "RecordCreateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_RecordStatus",
                table: "Nodes",
                column: "RecordStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_RecordUpdateDate",
                table: "Nodes",
                column: "RecordUpdateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_StyleId",
                table: "Nodes",
                column: "StyleId");

            migrationBuilder.CreateIndex(
                name: "IX_Styles_RecordCreateDate",
                table: "Styles",
                column: "RecordCreateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Styles_RecordStatus",
                table: "Styles",
                column: "RecordStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Styles_RecordUpdateDate",
                table: "Styles",
                column: "RecordUpdateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RecordCreateDate",
                table: "Users",
                column: "RecordCreateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RecordStatus",
                table: "Users",
                column: "RecordStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RecordUpdateDate",
                table: "Users",
                column: "RecordUpdateDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Nodes");

            migrationBuilder.DropTable(
                name: "Maps");

            migrationBuilder.DropTable(
                name: "Styles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
