using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using tohoku_recovery_311.Data;
using tohoku_recovery_311.Models;

namespace tohoku_recovery_311.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class UserVisitsController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public UserVisitsController(ApplicationDbContext context,
            UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // get clicked POI's record by POI's code
        [HttpGet("Get")]
        public IActionResult Get(string code)
        {
            var userId = _userManager.GetUserId(User);

            var visit = _context.UserVisits
                .FirstOrDefault(v => v.UserId == userId && v.Code == code);

            if (visit == null)
            {
                return Json(new { visitCount = 0, record = "" });
            }

            return Json(visit);
        }

        // save / update visit record
        [HttpPost("Save")]
        public IActionResult Save([FromBody] UserVisit model)
        {
            var userId = _userManager.GetUserId(User);


            var visit = _context.UserVisits
                .FirstOrDefault(v => v.UserId == userId && v.Code == model.Code);

            if (visit == null) // add new record
            {
                visit = new UserVisit
                {
                    UserId = userId,
                    Code = model.Code,
                    VisitCount = model.VisitCount,
                    Record = model.Record
                };

                _context.UserVisits.Add(visit);
            }
            else // update existing record
            {
                visit.VisitCount = model.VisitCount;
                visit.Record = model.Record;
                Console.WriteLine("Update record");
            }
            _context.SaveChanges();
            return Ok();
        }

        // get login user's visited POI (code list)
        [HttpGet("uservisits")]

        public IActionResult GetUserVisits()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var visits = _context.UserVisits
                .Where(v => v.UserId == userId)
                .Select(v => v.Code)
                .ToList();

            return Ok(visits);
        }
    }
}
