using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using RendePayUI.Models;

namespace RendePayUI.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://afford-unbridle-apprehend.ngrok-free.dev/api/cards";

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public ApiService()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("ngrok-skip-browser-warning", "true");
        }

        // 1. جلب البطاقات
        public async Task<List<Card>> GetCardsAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync(BaseUrl);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<List<Card>>(json, JsonOptions) ?? new List<Card>();
                }
                return new List<Card>();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[GetCards Exception]: {ex.Message}");
                return new List<Card>();
            }
        }

        // 2. إنشاء بطاقة جديدة
        public async Task<(bool IsSuccess, string ErrorMessage)> CreateCardAsync(string title)
        {
            try
            {
                string uniqueCode = new Random().Next(10000000, 99999999).ToString();

                var newCard = new
                {
                    title = title,
                    code = uniqueCode,
                    balance = 0.00m,
                    active = true
                };

                var response = await _httpClient.PostAsJsonAsync(BaseUrl, newCard);

                if (response.IsSuccessStatusCode)
                {
                    return (true, string.Empty);
                }

                string errorText = await response.Content.ReadAsStringAsync();
                return (false, $"[(Status: {(int)response.StatusCode})]: {errorText}");
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        // 3. شحن رصيد
        public async Task<bool> TopUpAsync(long cardId, decimal amount)
        {
            try
            {
                var payload = new { amount = amount };
                var response = await _httpClient.PutAsJsonAsync($"{BaseUrl}/{cardId}/top-up", payload);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        // 4. سحب رصيد
        public async Task<bool> WithdrawAsync(long cardId, decimal amount)
        {
            try
            {
                var payload = new { amount = amount };
                var response = await _httpClient.PutAsJsonAsync($"{BaseUrl}/{cardId}/withdraw", payload);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        // 5. تحويل أموال بين بطاقتين
        public async Task<(bool IsSuccess, string ErrorMessage)> TransferMoneyAsync(long sourceCardId, string targetCardCode, decimal amount)
        {
            try
            {
                var payload = new { sourceCardId, targetCardCode, amount };
                var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}/transfer", payload);

                if (response.IsSuccessStatusCode)
                    return (true, string.Empty);

                string errorText = await response.Content.ReadAsStringAsync();
                return (false, errorText);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }
    }
}