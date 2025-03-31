using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MindHub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class RenameUserToInviter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invites_Users_UserId",
                table: "Invites");

            migrationBuilder.DropIndex(
                name: "IX_Invites_UserId",
                table: "Invites");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Invites");

            migrationBuilder.CreateIndex(
                name: "IX_Invites_InviterId",
                table: "Invites",
                column: "InviterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invites_Users_InviterId",
                table: "Invites",
                column: "InviterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invites_Users_InviterId",
                table: "Invites");

            migrationBuilder.DropIndex(
                name: "IX_Invites_InviterId",
                table: "Invites");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Invites",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invites_UserId",
                table: "Invites",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invites_Users_UserId",
                table: "Invites",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
