using Plugin.NFC;
using System.Text;

namespace RendePayUI.Services // <-- تأكد أن النيم سبيس ينتهي بـ .Services
{
    public class NfcService // <-- تأكد أنها public class وليس internal
    {
        public event Action<string>? OnCardScanned;

        public void Initialize()
        {
            if (CrossNFC.IsSupported && CrossNFC.Current.IsAvailable)
            {
                CrossNFC.Current.OnMessageReceived += Current_OnMessageReceived;
                CrossNFC.Current.StartListening();
            }
        }

        private void Current_OnMessageReceived(ITagInfo tagInfo)
        {
            if (tagInfo?.Records == null || tagInfo.Records.Length == 0)
                return;

            var record = tagInfo.Records[0];
            string scannedData = Encoding.UTF8.GetString(record.Payload);

            OnCardScanned?.Invoke(scannedData);
        }

        public void StopListening()
        {
            if (CrossNFC.IsSupported)
            {
                CrossNFC.Current.StopListening();
            }
        }
    }
}