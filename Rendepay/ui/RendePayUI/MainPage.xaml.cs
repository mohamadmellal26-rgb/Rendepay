using RendePayUI.Models;
using RendePayUI.Services;
using RendePayUI.Popups;
using CommunityToolkit.Maui.Views;

namespace RendePayUI
{
    public partial class MainPage : ContentPage
    {
        private readonly ApiService _apiService = new();
        private readonly NfcService _nfcService = new();

        public MainPage()
        {
            InitializeComponent();
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();

            // الاشتراك في حدث الـ NFC عند ظهور الصفحة
            _nfcService.OnCardScanned += HandleNfcScanned;
            _nfcService.Initialize();

            await LoadCards();
        }

        protected override void OnDisappearing()
        {
            base.OnDisappearing();

            // إلغاء الاشتراك لتجنب تسريب الذاكرة Memory Leak
            _nfcService.OnCardScanned -= HandleNfcScanned;
            _nfcService.StopListening();
        }

        private async Task LoadCards()
        {
            try
            {
                var cards = await _apiService.GetCardsAsync();
                CardsListView.ItemsSource = cards;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[Error] LoadCards failed: {ex.Message}");
            }
        }

        private async void OnCreateCardClicked(object sender, EventArgs e)
        {
            string title = NewCardTitleEntry.Text?.Trim();
            if (string.IsNullOrWhiteSpace(title)) return;

            var (isSuccess, errorMsg) = await _apiService.CreateCardAsync(title);

            if (isSuccess)
            {
                NewCardTitleEntry.Text = string.Empty;
                await LoadCards();
            }
        }

        private async void OnTransferClicked(object sender, EventArgs e)
        {
            var card = ExtractBindingContext<Card>(sender);

            if (card?.Id.HasValue == true)
            {
                // إظهار منبثق التحويل المخصص
                var popup = new TransactionPopup("Transfer Funds", isTransfer: true);
                var result = await this.ShowPopupAsync(popup) as TransactionResult;

                if (result != null)
                {
                    var (isSuccess, _) = await _apiService.TransferMoneyAsync(card.Id.Value, result.TargetCode, result.Amount);
                    if (isSuccess)
                    {
                        await LoadCards();
                    }
                }
            }
        }

        private async void OnWithdrawClicked(object sender, EventArgs e)
        {
            var card = ExtractBindingContext<Card>(sender);

            if (card?.Id.HasValue == true)
            {
                // إظهار منبثق الخصم/السحب المخصص
                var popup = new TransactionPopup("Withdraw Funds", isTransfer: false);
                var result = await this.ShowPopupAsync(popup) as TransactionResult;

                if (result != null)
                {
                    bool success = await _apiService.WithdrawAsync(card.Id.Value, result.Amount);
                    if (success)
                    {
                        await LoadCards();
                    }
                }
            }
        }

        private async void HandleNfcScanned(string cardCode)
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await LoadCards();
            });

            await Task.CompletedTask;
        }

        private async void OnRefreshClicked(object sender, EventArgs e)
        {
            await LoadCards();
        }

        /// <summary>
        /// استخراج البيانات المربوطة (CommandParameter أو BindingContext)
        /// بغض النظر عن عنصر الـ UI الذي تم ضغطه (Border / TapGestureRecognizer / Button)
        /// </summary>
        private T ExtractBindingContext<T>(object sender) where T : class
        {
            if (sender is T directContext)
                return directContext;

            if (sender is BindableObject bindable)
            {
                if (bindable is TapGestureRecognizer tapGesture && tapGesture.CommandParameter is T gestureParam)
                    return gestureParam;

                if (bindable.BindingContext is T context)
                    return context;
            }

            return null;
        }
    }
}