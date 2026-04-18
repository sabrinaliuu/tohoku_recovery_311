using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace tohoku_recovery_311.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFieldNameGeoPoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Level",
                table: "GeoPoints",
                newName: "Category");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserVisits",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Category",
                table: "GeoPoints",
                newName: "Level");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserVisits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
